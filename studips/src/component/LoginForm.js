import React from 'react'
import '../App.css';


class LoginForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            firstname : '',
            lastname : '',
            tel: '',
            password : '',
            confirmedPassword: '',
            email : '',
            birthday: '',
            hobbies : '',
            study : '',
            bio : '',
            city : '',
            nextPage : true,
        };
        
        this.onChange = this.onChange.bind(this);
        this.postForm = this.postForm.bind(this);
        this.secondPageAppear = this.secondPageAppear.bind(this);
        this.returnFonction = this.returnFonction.bind(this);
    }
   
    onChange(e){
        this.setState({
            [e.target.name] : e.target.value,
        });
    }
    postForm (e){
        e.preventDefault();
        const config = {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
            },
            body: JSON.stringify(this.state),
        };
    const url = "http://localhost8000/users";
    fetch(url, config)
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                alert(res.error);
            } else {
                alert(`Votre compte à bien été créé!`);
            }
      }).catch(e => {
        console.error(e);
        alert('Erreur lors de la création de votre compte');
      });
    }
    secondPageAppear = () => {
         this.setState({
             nextPage: false
         })
    }
    returnFonction= () => {
        this.setState({
            nextPage: true
        })  
    }
    
    render(){
        return(
            <div className = 'loginFormu' >
                
                {this.state.nextPage ?
                <div className= 'loginFormu'>
                <p className='titlePage'>Création d'un compte</p>
                <form onSubmit = {this.postForm}/>
                <div id ='firstPageInscription'>
                    <div className="form-data">   
                        <input placeholder='Prénom'
                            type="text"
                            id="firstname"
                            name="firstname"
                            onChange={this.onChange}
                            value={this.state.firstname}/>
                        
                        <input placeholder='Nom'
                            type="text"
                            id="lastname"
                            name="lastname"
                            onChange={this.onChange}
                            value={this.state.lastname}/>
                         <input placeholder='Numéro de téléphone'
                            type="text"
                            id="tel"
                            name="tel"
                            onChange={this.onChange}
                            value={this.state.tel}/>
                        <input placeholder='Email'
                            type="email"
                            id="email"
                            name="email"
                            onChange={this.onChange}
                            value={this.state.email}/>
                        <input placeholder='Mot de passe'
                            type="password"
                            id="password"
                            name="password"
                            onChange={this.onChange}
                            value={this.state.password}/>
                        
                        <input placeholder='Confirmation mot de passe'
                            type="password"
                            id="confirmedPassword"
                            name="confirmedPassword"
                            onChange={this.onChange}
                            value={this.state.confirmedPassword}/>
                        
                        
                        <div className='nextButton'>
                            <button onClick = {this.secondPageAppear}>Suivant</button>
                        </div>
                        
                    </div>
                </div> 
                </div>
                :   
                    <div id='secondPageInscription'>
                        <img src='https://zupimages.net/up/19/51/wege.png' id = 'return' onClick= {this.returnFonction} alt = ''></img>
                        <div className="form-dataSecond">
                            
                            <input placeholder = 'Date de naissance'
                                type="date"
                                id="birthday"
                                name="birthday"
                                onChange={this.onChange}
                                value={this.state.birthday}/>
                            
                            <input placeholder = 'Hobbies'
                                type="text"
                                id="hobbies"
                                name="hobbies"
                                onChange={this.onChange}
                                value={this.state.hobbies}/>
                            
                            <input placeholder = 'Etudes'
                                type="text"
                                id="study"
                                name="study"
                                onChange={this.onChange}
                                value={this.state.study}/>
                           
                            <input placeholder = 'Un peu plus sur toi'
                                type="text"
                                id="bio"
                                name="bio"
                                onChange={this.onChange}
                                value={this.state.bio}/>
                            
                            <input placeholder = 'Ville'
                                type="text"
                                id="city"
                                name="city"
                                onChange={this.onChange}
                                value={this.state.city}/>
                
                            <div className='validButton'>
                                <button type='submit'  onClick= {this.postForm}>S'inscrire</button>
                            </div>
                        </div>
                    </div>
                    
                }
            </div>
        
        )
    }
}








export default LoginForm
