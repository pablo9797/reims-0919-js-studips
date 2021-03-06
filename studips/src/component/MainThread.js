import React from 'react';
import PostCard from './PostCard';
import '../App.css';
import library from '../images/library.svg'
import homeIcon from '../images/home-solid.svg';
import menuIcon from '../images/bars-solid.svg';
import axios from 'axios';
import PostModal from './PostModal';
import Menu from './Menu';
import { Redirect } from 'react-router-dom';
import decode from 'jwt-decode';
import Library from './Library';
import messageIcon from '../images/comments-solid.svg';
import Messaging from './Messaging';
// import { removeAllListeners } from 'nodemon';

class MainThread extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			search:'',
			posts: [],
			activeId:'',
			userData: null,
			isPostModalVisible: false,
			isMenuVisible: false,
			newPost: {
				title: null,
				category: null,
				content: null
			},
			newPv: {
				recipientId: null,
				content: null
			},
			contactList: null,
			userList: null,
			userFilter: null,
			isContactListVisible: true,
			isConversationVisible: false,
			isUserListVisible: false,
			conversations: [],
			eventDate: new Date()
		};
		this.toggleNewPost = this.toggleNewPost.bind(this);
		this.toggleMenuVisible = this.toggleMenuVisible.bind(this);
		this.handleChangeTab = this.handleChangeTab.bind(this);
		this.handleChangeNewPost = this.handleChangeNewPost.bind(this);
		this.handleSubmitNewPost = this.handleSubmitNewPost.bind(this);
		this.getThread = this.getThread.bind(this);
		this.handleEventDate = this.handleEventDate.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleLikePost = this.handleLikePost.bind(this);
		this.handleSavePost = this.handleSavePost.bind(this);
		this.getConversation = this.getConversation.bind(this);
		this.handleContactList = this.handleContactList.bind(this);
		this.handleChangeNewPvMess = this.handleChangeNewPvMess.bind(this);
		this.handleSubmitPrivateMessage = this.handleSubmitPrivateMessage.bind(this);
		this.getConversationAfterPv = this.getConversationAfterPv.bind(this);
		this.handleUserList = this.handleUserList.bind(this);
		this.handleChangeUserListFilter = this.handleChangeUserListFilter.bind(this);
		this.getUserList = this.getUserList.bind(this);
		this.handleAddNewContact = this.handleAddNewContact.bind(this);
	}
	componentDidMount() {
		this.getUserData();
		this.getThread();
	}
	getUserData() {
		const token = this.props.token
		const tokenObject = decode(token)
		const userId = tokenObject.sub
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		axios
			.get(`http://localhost:8000/profiles/${userId}`, axiosConfig)
			.then(response => this.setState({ userData: response.data[0] }))		
	}
	getThread() {
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		const tokenObject = decode(token)
		const userId = tokenObject.sub
		const postsReq = axios.get('http://localhost:8000/posts', axiosConfig)
		const savesReq = axios.get('http://localhost:8000/postsaves', axiosConfig)
		const contactListRequest = axios.get(`http://localhost:8000/${userId}/contacts`, axiosConfig)
		axios
			.all([postsReq, savesReq, contactListRequest])
			.then(axios.spread((postsData, postsSaves, contactListData) => {
				let newPosts = []
				this.setState(() => {
					for (let i = 0 ; i < postsData.data.length ; i++) {
						newPosts.push(postsData.data[i])
						newPosts[i].isPostSavedByUser = postsSaves.data[i].savedByUser
					}
					return {posts: newPosts, search: '', activeId: '', contactList: contactListData.data}
				})
			}))
	}
	toggleNewPost() {
		this.setState(prevState => {
			return { isPostModalVisible: !prevState.isPostModalVisible };
		});
	}
	handleChangeTab(event){
		const buttonId = event.target.id;
		this.setState({ activeId: buttonId});
	}
	getTabContent() {
		let posts = this.state.posts;
		if (this.state.search.length > 0) {
			posts = posts.filter(
				post => ([
					post.city,
					post.firstname,
					post.lastname,
					post.study,
				].map(string => string.toLowerCase()).includes(this.state.search.toLowerCase()))
			);
		}
		switch(this.state.activeId) {
		  	case 'stages':	
				posts = posts
					.filter(post=>post.category  === 'Jobs')
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
						return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
					})
			break;
		  	case 'logements':
				posts = posts
					.filter(post=>post.category==='Logements')
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
						return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
					})
			break;
		  	case 'events':
				posts = posts
					.filter(post=>post.category==='Events')
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
						return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
					})
			break;
		  	case 'cours':
				posts = posts
					.filter(post=>post.category==='Cours')
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
						return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
					})
			break;
		  	case 'fournitures':
				posts = posts
					.filter(post=>post.category==='Fournitures')
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
						return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
					})
			break;
			case 'library':	
				return (
					<>
						<Library />			
						{posts = posts
							.filter(post => post.isPostSavedByUser === 1)
							.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
							.map((post) => {
								return React.Children.toArray(<PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>)
							})
						}
					</>
				)
			case 'messaging':
				return (
					<>
						<Messaging 
							contactList={this.state.contactList}
							conversations={this.state.conversations}
							getConversation={this.getConversation}
							getConversationAfterPv={this.getConversationAfterPv}
							isContactListVisible={this.state.isContactListVisible}
							isConversationVisible={this.state.isConversationVisible}
							handleContactList={this.handleContactList}
							handleChangeNewPvMess={this.handleChangeNewPvMess}
							handleSubmitPrivateMessage={this.handleSubmitPrivateMessage}
							userId={this.state.userData.id}
							handleUserList={this.handleUserList}
							isUserListVisible={this.state.isUserListVisible}
							handleChangeUserListFilter={this.handleChangeUserListFilter}
							getUserList={this.getUserList}
							userList={this.state.userList}
							handleAddNewContact={this.handleAddNewContact}/>
					</>
				)
			break;
		  	default:
		  		posts = posts
					.sort((a, b) => a.created_at > b.created_at ? -1 : 1)
					.map((post) => {
			  			return <PostCard handleSavePost={this.handleSavePost} postData={post} handleLikePost={this.handleLikePost}/>
		})
		  break;
		}
		return React.Children.toArray(posts);
	}
	toggleMenuVisible() {
		this.setState(prevState => {
			return { isMenuVisible: !prevState.isMenuVisible };
		});
	}
	handleChangeNewPost(event) {
		const propertyName = event.target.name;
		const newPost = this.state.newPost;
		newPost[propertyName] = event.target.value;
		this.setState({ newPost: newPost });
	}
	handleEventDate(date) {
		this.setState({eventDate: date})
	}
	handleSubmitNewPost(e) {
		e.preventDefault();
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		const eventDate = this.state.eventDate.toISOString().slice(0, 19).replace('T', ' ')
		let newPostData = {
			category: this.state.newPost.category,
			title: this.state.newPost.title,
			content: this.state.newPost.content,
			event_date: eventDate
		}
		axios
			.post('http://localhost:8000/posts', newPostData, axiosConfig)
			.then(res => console.log(res))
			.catch(err => console.log(err));
		this.setState({ isPostModalVisible: false }, () =>
			setTimeout(this.getThread(), 1000),
		);
	}
	handleSubmitPrivateMessage(e) {
		e.preventDefault()
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		const contactId = this.state.recipientId
		const newPvMessage = {
			sender_id: this.state.userData.id,
			recipient_id: this.state.recipientId,
			content: this.state.newPv.content
		}
		axios
			.post('http://localhost:8000/conversation', newPvMessage, axiosConfig)	
			.then(res => console.log(res))
			.catch(err => console.log(err))
			.then(setTimeout(() => this.getConversationAfterPv(contactId), 150))
	}
	handleAddNewContact(contactId) {		
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		const newPvMessage = {
			sender_id: this.state.userData.id,
			recipient_id: contactId,
			content: "Bonjour, je t'ai ajouté à ma list de contacts"
		}
		axios
			.post('http://localhost:8000/conversation', newPvMessage, axiosConfig)	
			.then(res => console.log(res))
			.catch(err => console.log(err))
			// .then(setTimeout(() => this.getConversation(contactId), 150))
	}
	handleChangeNewPvMess(event) {
		const propertyName = event.target.name;
		const newPvMess = {...this.state.newPv};
		newPvMess[propertyName] = event.target.value;
		this.setState({ newPv: newPvMess });
	}
	handleLikePost(e) {
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		let newLike = {post_id: e.target.name}
		axios
			.put('http://localhost:8000/likes', newLike, axiosConfig)
			.then(res => console.log(res))
			.catch(err => console.log(err))
			.then(setTimeout(() => this.getThread(), 150))
	}
	handleSavePost(e) {
		const token = this.props.token
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		let newSave = {post_id: e.target.name}
		axios
			.put('http://localhost:8000/postsaves', newSave, axiosConfig)
			.then(res => console.log(res))
			.catch(err => console.log(err))
			.then(setTimeout(() => this.getThread(), 150))
	}	
	handleInputChange(event) {
		this.setState({search: event.target.value})
	}
	getConversation(contactId) {
		const token = this.props.token
		const tokenObject = decode(token)
		const userId = tokenObject.sub
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		axios
			.get(`http://localhost:8000/${userId}/contacts/${contactId}/conversation`, axiosConfig)
			.then(data => {
				this.setState(() => {
					const recipient_id = contactId
					return { conversations: data.data , recipientId: recipient_id }
				})
			})
			setTimeout(() => this.handleContactList(), 500)
	}
	getConversationAfterPv(contactId) {		
		const token = this.props.token
		const tokenObject = decode(token)
		const userId = tokenObject.sub
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		axios
			.get(`http://localhost:8000/${userId}/contacts/${contactId}/conversation`, axiosConfig)
			.then(data => {
				this.setState(() => {
					const recipient_id = contactId
					return { conversations: data.data , recipientId: recipient_id }
				})
			})
	}
	handleContactList() {
		this.setState((prevState) => {
			return {isContactListVisible: !prevState.isContactListVisible, isConversationVisible: !prevState.isConversationVisible}
		})
	}
	handleUserList() {
		this.setState((prevState) => {
			return {isUserListVisible: !prevState.isUserListVisible, isContactListVisible: !prevState.isContactListVisible}
		})
	}
	handleChangeUserListFilter(e) {
		this.setState({ userFilter: e.target.value })
	}
	getUserList() {
		const token = this.props.token
		const tokenObject = decode(token)
		const axiosConfig = {
        	headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
    		}
    	}
		const searchFilter = this.state.userFilter
		axios
			.get(`http://localhost:8000/profiles/search/${searchFilter}`, axiosConfig)
			.then(response => this.setState({ userList: response.data }))

	}
	render() {
		const isNotConnected = this.props.token === null;
		if (isNotConnected) {
			return <Redirect to='/login' />;
		}
		return (
			<>				
				{this.state.isMenuVisible && (
					<div onClick={this.toggleMenuVisible}>
						<Menu 
							handleChangeTab={this.handleChangeTab}
							userData={this.state.userData}/>
					</div>
				)}
				<PostModal
						isPostModalVisible={this.state.isPostModalVisible}
						toggleNewPost={this.toggleNewPost}
						handleChangeNewPost={this.handleChangeNewPost}
						handleSubmitNewPost={this.handleSubmitNewPost}
						postCategory={this.state.newPost.category}
						eventDate={this.state.eventDate}
						handleEventDate={this.handleEventDate}/>
				<div className='topButtons'>
					<img
						className='icon space:inline'
						src={menuIcon}
						alt='menu'
						onClick={this.toggleMenuVisible}
					/>
					<div className='inputCity space:inline'>
						<input
							type="text"
							onChange={ this.handleInputChange }
							placeholder="Search"/>
					</div>
					<button className='postButton2' onClick={this.toggleNewPost}>
						+
					</button>
				</div>
					<div className='cardList'>
						{this.getTabContent()}
					</div>
				<div className='navbar'>
					<img
						className="icon"
						src={homeIcon}
						alt="to home"
						onClick={this.getThread}/>
					
					<img
						id='messaging'
						className="icon"
						src={messageIcon}
						alt="messaging"
						onClick={this.handleChangeTab}/>
					<img
						id='library'
						className="icon"
						src={library}
						alt='library'
						onClick={this.handleChangeTab}/>						
				</div>			
			</>)	
	}	
}

export default MainThread;