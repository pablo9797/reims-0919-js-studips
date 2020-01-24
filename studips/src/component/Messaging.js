import React from 'react';
import ContactCard from './ContactCard';
import PrivateMessage from './PrivateMessage';
import PvModal from './PvModal';

function Messaging({
	contactList,
	isContactListVisible,
	isConversationVisible,
    isPvModalVisible,
	getConversation,
    getConversationAfterPv,
	conversations,
    handleContactList,
    handleChangeNewPvMess,
    handleSubmitPrivateMessage,
    togglePvModal,
	userId
}) {
	return (
		<div className='messaging'>
            <p className='titleMessaging'>Messagerie</p>
			{isContactListVisible && (
				<div className='contactList'>
					<p className='contactListTitle'>Liste de contacts</p>
					{contactList.map(contact => (
						<ContactCard
							contactData={contact}
							isContactListVisible={isContactListVisible}
							isConversationVisible={isConversationVisible}
							getConversation={getConversation}
						/>
					))}
				</div>
			)}
			{isConversationVisible && (
                <>
                    <PvModal 
                        handleChangeNewPvMess={handleChangeNewPvMess}
                        handleSubmitPrivateMessage={handleSubmitPrivateMessage}
                        isPvModalVisible={isPvModalVisible}
                        togglePvModal={togglePvModal}/>
                    <button 
						onClick={handleContactList}
						className='returnContactList'>Retour</button>
                    <div className='messageList'>
                        {conversations.map(message => <PrivateMessage messageData={message} userId={userId} />)}
                    </div>
                    <button 
                        className='sendPvMessage'
                        onClick={togglePvModal}>Envoyer un message</button>
                </>
			)}
		</div>
	);
}

export default Messaging;
