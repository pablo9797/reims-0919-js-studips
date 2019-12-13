import React from 'react';
import PostCard from './PostCard';
import '../App.css';
import homeIcon from '../images/home-solid.svg';
import searchIcon from '../images/search-solid.svg';
import messageIcon from '../images/comments-solid.svg';
import menuIcon from '../images/bars-solid.svg';
import notifIcon from '../images/bell-solid.svg';
import axios from 'axios';
import Menu from './Menu'

class MainThread extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			posts: [],
			isMenuVisible:false,
		};
		this.toggleMenuVisible = this.toggleMenuVisible.bind(this);
	}
	componentDidMount() {
		axios
			.get("http://localhost:8000/posts")
			.then(response => response.data)
			.then(data => {
				this.setState({
                    posts: data
				})
			});
	}
	toggleMenuVisible() {
		this.setState((prevState) => {
			return {isMenuVisible: !prevState.isMenuVisible}
		});
	}
	render() {
		return (
			<>
				{this.state.isMenuVisible && <div onClick={this.toggleMenuVisible}>
					<Menu/>
				</div>}
				<div className='topButtons'>
					<img className="icon"
					src={menuIcon}
					alt="menu"
					
					onClick={this.toggleMenuVisible} />
					<button className='postButton'>Poster un message</button>
				</div>
				<div className='cardList'>
					{this.state.posts.map(post => {
						return (
							<PostCard postData={post} />
						)
					})}
				</div>
				<div className='navbar'>
					<img 
						className="icon"
						src={homeIcon}
						alt="to home"/>
					<img
						className="icon"
						src={searchIcon}
						alt="search"/>
					<img
						className="icon"
						src={messageIcon}
						alt="messages"/>	
					<img
						className="icon"
						src={notifIcon}
						alt="notifications"/>
				</div>
			</>
		)
	}	
}

export default MainThread;
