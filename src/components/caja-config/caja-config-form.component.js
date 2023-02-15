import React, { Component } from 'react';
import axios from 'axios';
import UserContext  from '../../UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default class CajaConfigForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            codigo:'',
            descripcion: '',
            user_created: '',
            user_updated: '',
            textButton:'Crear',
            titleForm: 'Crear Caja',
            idUpdate: 'NEW'
        };        
    }
     //Metodo que se ejecuta antes del render
     componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name}) 
    }

    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-config/"+this.props.idUpdate)
                .then(response => {
                    this.setState({    
                        descripcion: response.data.descripcion,   
                        textButton:'Editar',
                        titleForm: 'Editar Caja'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    descripcion:'',
                    textButton:'Crear',
                    titleForm: 'Crear Caja',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }    
    
    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    
    showNotification(isSuccess){
        document.querySelector('#alert').classList.replace('hide','show');
        if(isSuccess === true){
            document.querySelector('#alert').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert #text').innerHTML = '<strong>Exito!</strong> Los datos han sido actualizados.'
        }else{
            document.querySelector('#alert').classList.replace('alert-success','alert-warning');
            document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> Contacte con el administrador.'
        }
        //Enfocar el input
        this._input.focus(); 
        //actualizar Lista
        this.props.onUpdateParentList('true');
        setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);
    }

    handleCloseAlert = () =>{
        document.querySelector('#alert').classList.replace('show','hide');
    }
    
    onSubtmit = (e) => {
        e.preventDefault();
        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const caja = {
                descripcion: this.state.descripcion,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL + '/cajas-config/add',caja)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));

                this.setState({
                    descripcion: '',
                    textButton:'Crear',
                    titleForm: 'Crear Inventario',
                    idUpdate:'NEW'
                })
                   
        }else{
            const caja = {
                descripcion: this.state.descripcion,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL+ '/cajas-config/update/'+this.state.idUpdate,caja)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
        }

        
    }   
    
    render(){          
        return(
            <div className="container"> 
                <h3>{this.state.titleForm}</h3>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Descripcion: </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required
                                    className="form-control"
                                    value={this.state.descripcion}
                                    onChange={this.onChangeDescripcion} 
                                />
                            </div>   
                        </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-warning"><FontAwesomeIcon icon={faArrowLeft}/> {this.state.textButton}</button>
                    </div>        
                    <div id="alert" className="alert alert-success alert-dismissible fade hide" role="alert">
                        <span id="text"></span>
                        <button type="button" className="close" onClick={this.handleCloseAlert}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>                                
                </form>
            </div>
        )
    }
}
