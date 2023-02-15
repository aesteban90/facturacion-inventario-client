import React, {Component} from 'react';
import axios from 'axios';
import moment from 'moment';
import Select from 'react-select';
import UserContext  from '../../UserContext';
import { NumericFormat } from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default class CajaForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            fechaApertura: new Date(),            
            fechaCierre: null,
            cajaSelected: {},
            cajaOptions: [],
            montoApertura: '',
            montoCierre: '',
            user_created: '',
            user_updated: '',
            textButton:'Abrir',
            titleForm: 'Abrir Caja',
            idUpdate: 'NEW'
        };        
    }
    
    //Metodo que se ejecuta antes del render
    componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name});
        this.getCajasConfigOptions(); //Obtener Cajas Config
    }    

    getCajasConfigOptions = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL  + "/cajas-config/").then(response => {
            let options = [];
            if(response.data.length > 0 ){
                response.data.forEach(element => {options.push({value:element._id,label:element.descripcion})});
                this.setState({cajaSelected: options[0], cajaOptions: options});
            }else{
                this.setState({cajaSelected: {}, cajaOptions: []});
            }
        }).catch(err => console.log(err))
    }
    onChangeCajas = (selectedOption) => {this.setState({cajaSelected: selectedOption})}
    onChangeMontoApertura = (e) => {this.setState({montoApertura: e.target.value})}
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
        //this._input.focus(); 
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
                caja: this.state.cajaSelected.value,
                estado: 'Abierto',
                fechaApertura: this.state.fechaApertura,
                montoApertura: this.state.montoApertura.replace(/\./gi,''),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL  + '/cajas/add',caja)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
                this.setState({
                    cajaSelected: this.state.cajaOptions[0],
                    montoApertura: '',
                    textButton:'Abrir',
                    titleForm: 'Abrir Caja',
                    idUpdate:'NEW'
                })   
                              
        }else{            
            const caja = {
                montoApertura: this.state.montoApertura,
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL  + '/cajas/update/'+this.state.idUpdate,caja)
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
                                <label>Fecha Apertura: </label>                                    
                                <input type="text" 
                                    disabled
                                    className="form-control"
                                    value={moment(this.state.fechaApertura).format("DD/MM/YYYY")}
                                />
                            </div>    
                            <div className="form-group col-md-12">
                                <label>Caja: </label>
                                <Select               
                                    noOptionsMessage={() => 'Cajas no Configuradas'}
                                    value={this.state.cajaSelected} 
                                    options={this.state.cajaOptions} 
                                    onChange={this.onChangeCajas}  
                                    required/>
                            </div>                          
                            <div className="form-group col-md-12">
                                <label>Monto Inicial: </label>
                                <NumericFormat      
                                    autoFocus={true}
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.montoApertura}
                                    onChange={this.onChangeMontoApertura}
                                    required
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
