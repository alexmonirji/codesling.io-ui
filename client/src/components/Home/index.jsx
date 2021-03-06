import React, { Component } from 'react';
import randomstring from 'randomstring';
import axios from 'axios';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import Button from '../globals/Button';
import Logo from '../globals/Logo';

import './LandingPage.css';

let slingId;

class Home extends Component {
  state = {
    allUsers: [],
    selectedUser: {},
    allFriends: [],
    selectedFriend: {},
    allChallenges: [],
    selectedChallenge: {}
  }

  async componentDidMount() {
    const id = localStorage.getItem('id');
    let allChallenges = [];
    const challenges = await axios.get(`http://localhost:3396/api/usersChallenges/${id}`);
    const users = await axios.get('http://localhost:3396/api/users/fetchAllUsers');
    const friends = await axios.get(`http://localhost:3396/api/friends/fetchAllFriends/${id}`);
    
    if (challenges.data && challenges.data.rows.length) {
      allChallenges = challenges.data.rows;
    }

    if (users.data && users.data.rows.length) {
      this.setState({ allUsers: users.data.rows, selectedUser: users.data.rows[0] });
    }
    
    if (friends.data && friends.data.length) {
      for (let i = 0; i < friends.data.length; i++) {
        let friendChallenges = await axios.get(`http://localhost:3396/api/usersChallenges/${friends.data[i].id}`);
        
        if (friendChallenges.data && friendChallenges.data.rows.length) {
          allChallenges = allChallenges.concat(friendChallenges.data.rows);
        }
      }
    }

    this.setState({
      allFriends: friends.data,
      selectedFriend: friends.data[0],
      allChallenges: allChallenges,
      selectedChallenge: allChallenges[0]
    });
  }

  randomSlingId = () => {
    slingId = `${randomstring.generate()}`;
  }

  handleDuelClick = () => {
    this.randomSlingId();
    this.props.history.push({
      pathname: `/${slingId}`,
      state: {
        challenge: this.state.selectedChallenge
      }
    });
  }
  
  handleAddChallengeClick = () => {
    this.props.history.push('/addChallenge');
  }

  handleChallengeSelect = (challenge) => {
    this.setState({ selectedChallenge: challenge });
  }

  handleLogoutClick = () => {
    axios.get(`http://localhost:3396/api/auth/logout`);
    delete localStorage.email;
    delete localStorage.id;
    delete localStorage.token;
    this.props.history.push('/');
  }

  handleFriendSelect = (friend) => {
    this.setState({ selectedFriend: friend });
  }

  handleUserSelect = (user) => {
    this.setState({ selectedUser: user });
  }

  handleAddFriendClick = async () => {
    try {
      await axios.post('http://localhost:3396/api/friends/addFriend',
        { user_id: localStorage.getItem('id'), friend_id: this.state.selectedUser.id }
      );
      
      let friends = this.state.allFriends;
      friends.push(this.state.selectedUser);
      
      this.setState({
        allFriends: friends
      });
    } catch (err) {
      alert('Failed to add friend.');
    }
  }

  render() {
    return (
      <div className="landing-page-container">
        <Logo
          className="landing-page-logo"
        />
      <nav className="editor-navbar home-navbar">
        <ul>
          <li onClick={() => this.props.history.push('/history')}>History</li>
          <li onClick={() => this.handleLogoutClick()}>Logout</li>
        </ul>
      </nav>
        <br />
        <div>
          Users:
        </div>
        <DropDownMenu value={this.state.selectedUser || this.state.allUsers[0]} >
          {this.state.allUsers.map((user, i) => {
            return (
              <MenuItem value={user} primaryText={user.username} key={i} onClick={this.handleUserSelect.bind(null, user)} />
            );
          })}
        </DropDownMenu>

        <br />
        <Button
          backgroundColor="green"
          color="white"
          text="Add Friend"
          onClick={() => this.handleAddFriendClick()}
        />
        <br />

        <div>
          Friends:
        </div>
        <DropDownMenu value={this.state.selectedFriend || this.state.allFriends[0]} >
          {this.state.allFriends.map((friend, i) => {
            return (
              <MenuItem value={friend} primaryText={friend.username} key={i} onClick={this.handleFriendSelect.bind(null, friend)} />
            );
          })}
        </DropDownMenu>

        <br />
        <br />
        <div>
          Challenges:
        </div>
        <DropDownMenu value={this.state.selectedChallenge || this.state.allChallenges[0]} >
          {this.state.allChallenges.map((challenge, i) => {
            return (
              <MenuItem value={challenge} primaryText={challenge.title} key={i} onClick={this.handleChallengeSelect.bind(null, challenge)} />
            );
          })}
        </DropDownMenu>
        <br />
        <br />
        <Button
          backgroundColor="red"
          color="white"
          text="Create Challenge"
          onClick={() => this.handleAddChallengeClick()}
        />
        <br />
        <Button
          backgroundColor="red"
          color="white"
          text="Duel"
          onClick={() => this.handleDuelClick()}
        />
      </div>
    );
  }
}

export default Home;