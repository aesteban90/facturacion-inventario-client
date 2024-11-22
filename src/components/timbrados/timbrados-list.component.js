import React, {Component} from 'react';
import axios from 'axios';
import UserContext  from '../../UserContext';
import Spinner from 'react-bootstrap/Spinner';
import TimbradoForm from './timbrados-form.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import SwitchList from '../switch-toogle/switchList-toggle.component';

export default class TimbradosList extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            user: undefined,
            idUpdate: '',
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL + "/timbrados/")
            .then(response => {
                this.setState({
                    datos: response.data,
                    loading: false
                })
            })
            .catch(err => console.log(err))

        //Pagina la lista
        //window.paginar('list-group','list-group-item',true);
    }
    onChangeCheckList = (dato) => {       
        const timbrado = {
            datos: this.state.datos.filter(el => el._id !== dato._id),
            estado: 'activado',
            user_updated: this.state.user
        }
        axios.post(process.env.REACT_APP_SERVER_URL + '/timbrados/activar/'+dato._id, timbrado)
            .then(res => {
                //console.log(res)
            })
            .catch(err => console.log(err));         
    } 

    componentDidMount(){      
        const currentUser = this.context.currentUser;
        this.setState({user: currentUser.name}) 
        this.updateList();
    }
    componentDidUpdate(){
        this.state.datos.map((dato) => {
            if(dato.estado === 'activado'){
                document.querySelector('#toggle_'+dato._id).checked = true;
            }
        })
    }

    deleteData = async (jsondatos) => {
        await axios.delete(process.env.REACT_APP_SERVER_URL + "/timbrados/"+jsondatos._id)
            .then(res => console.log(res.data))
            .catch(err => console.log(err))

        this.setState({
            datos: this.state.datos.filter(el => el._id !== jsondatos._id)
        });
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}

    datalist(){
        return this.state.datos.map((dato, index) => {
            let dateExpira = new Date(dato.vencimiento);
            let expiraString =  ((dateExpira.getDate() > 9) ? dateExpira.getDate() : ('0' + dateExpira.getDate()))+ '/' + ((dateExpira.getMonth() > 8) ? (dateExpira.getMonth() + 1) : ('0' + (dateExpira.getMonth() + 1))) + '/' + dateExpira.getFullYear();
            
            return (
                <li className="list-group-item" key={dato._id}>
                    <div className="col-md-2 informante-check">
                        <SwitchList nameToggle="informanteToggle" idToggle={"toggle_"+dato._id} onToggle={() => this.onChangeCheckList(dato,index)} />                        
                    </div>
                    <div className="col-md-2">{dato.nombreEmpresa}</div>
                    <div className="col-md-2">{dato.ruc}</div>
                    <div className="col-md-2">{dato.numero}</div>
                    <div className="col-md-2">{expiraString}</div>
                    <div className="col-md-2 text-right">
                        <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button>
                        <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </li>)
        })
    } 
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Timbrados</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-2">Activar</div>
                                    <div className="col-md-2">Nombre Empresa</div>
                                    <div className="col-md-2">Ruc</div>
                                    <div className="col-md-2">Numero</div>
                                    <div className="col-md-2">Vencimiento</div>
                                    <div className="col-md-2 text-right">
                                        <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button>
                                    </div>                                 
                                </div>
                            </div>
                            <input className="form-control inputsearch" type="search" placeholder="Busqueda (minimo 3 letras)..." />
                            <ul id="list" className="list-group">
                                {this.state.loading  ? 
                                    <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                                :
                                    this.state.datos.length === 0 ?
                                        <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                    :
                                        this.datalist()
                                }
                            </ul>                     
                        </div>
                    </div>
                    <div className="col-md-4">
                        <TimbradoForm idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                    </div>
                </div>
            </div>
        )
    }
}