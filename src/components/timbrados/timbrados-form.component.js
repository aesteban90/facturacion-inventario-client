import React, {Component} from 'react';
import axios from 'axios';
import UserContext  from '../../UserContext';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default class TimbradoForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            ruc:'',
            nombreEmpresa:'',
            numero:'',
            vencimiento:'',
            user_created: '',
            user_updated: '',
            textButton:'Crear',
            titleForm: 'Crear Timbrado',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(process.env.REACT_APP_SERVER_URL + "/timbrados/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        ruc: response.data.ruc,
                        nombreEmpresa: response.data.nombreEmpresa,
                        numero: response.data.numero,
                        vencimiento: response.data.vencimiento,
                        textButton:'Editar',
                        titleForm: 'Editar Timbrado'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    ruc:'',
                    div:'',
                    razonsocial:'',
                    textButton:'Crear',
                    titleForm: 'Crear Timbrado',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }
    componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name}) 

        //Enfocar el input
        this._input.focus(); 
    }

    onChangeNumero = (e) => {this.setState({numero: e.target.value})}
    onChangeNombreEmpresa = (e) => {this.setState({nombreEmpresa: e.target.value})}
    onChangeRuc = (e) => { this.setState({ruc: e.target.value})}  
    onChangeVencimiento = (date) => { this.setState({ vencimiento: date })} 
    
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
            const timbrado = {
                ruc: this.state.ruc,
                nombreEmpresa: this.state.nombreEmpresa,
                numero: this.state.numero,
                estado: 'desactivado',
                vencimiento: this.state.vencimiento,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL + '/timbrados/add',timbrado)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
            this.setState({
                ruc:'',
                nombreEmpresa:'',
                numero:'',                
                vencimiento:'',
                textButton:'Crear',
                titleForm: 'Crear Timbrado',
                idUpdate:'NEW'
            })       
        }else{
            const timbrado = {
                ruc: this.state.ruc,
                nombreEmpresa: this.state.nombreEmpresa,
                numero: this.state.numero,
                vencimiento: this.state.vencimiento,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL + '/timbrados/update/'+this.state.idUpdate,timbrado)
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
                                <label>Nombre Empresa: </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required                                    
                                    className="form-control"
                                    value={this.state.nombreEmpresa}
                                    onChange={this.onChangeNombreEmpresa}
                                />
                            </div>
                            <div className="form-group col-md-6">
                                <label>Ruc: </label>
                                <input type="text" 
                                    required                                    
                                    className="form-control"
                                    value={this.state.ruc}
                                    onChange={this.onChangeRuc}
                                />
                            </div>  
                            <div className="form-group col-md-6">
                                <label>Numero: </label>
                                <input type="text" 
                                    required                                    
                                    className="form-control"
                                    value={this.state.numero}
                                    onChange={this.onChangeNumero}
                                />
                            </div>    
                            <div className="form-group vencimiento col-md-5">
                                <label>Vencimiento: </label>
                                <DatePicker 
                                    className="form-control" 
                                    required
                                    locale="esp"
                                    dateFormat="dd/MM/yyyy"
                                    selected={this.state.vencimiento}
                                    onChange={this.onChangeVencimiento}
                                    showYearDropdown
                                    isClearable
                                    customInput={
                                        <MaskedInput mask="11/11/1111" placeholder="mm/dd/yyyy" />
                                    }
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
