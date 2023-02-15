import React, { Component } from 'react';
import axios from 'axios';
import CajaForm from './caja-form.component';
import Spinner from 'react-bootstrap/Spinner';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { convertMiles } from '../../utils/utils';
import UserContext  from '../../UserContext';

export default class CajaList extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas/")
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

    componentDidMount(){this.updateList();}
    detalles = (jsondatos) => {window.location = "CajaDetalles?id="+jsondatos._id}    
    createData = (id) => {this.setState({idUpdate: id})}
    cerrarCaja = () => {
        //Cerrar Caja
    }
    datalist(){
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item" key={dato._id}>
                    <div className="col-md-3">{dato.cajaConf.descripcion} <br/><div className='alert alert-success-estado alert-success'>{dato.estado}</div> </div>
                    <div className="col-md-2">{moment(dato.fechaApertura).format("DD/MM/YYYY HH:mm:ss")}</div>
                    <div className="col-md-2">{dato.fechaCierre && moment(dato.fechaCierre).format("DD/MM/YYYY HH:mm:ss")}</div>
                    <div className="col-md-3">
                        <b>Apertura:</b> {convertMiles(dato.montoApertura)+" Gs."} <br/>
                        <b>Cierre:</b> {dato.montoCierre && convertMiles(dato.montoCierre)+" Gs."}
                    </div>
                    <div className="col-md-2">
                        <button onClick={() => this.detalles(dato)} type="button" className="btn btn-success btn-sm mr-1 mb-1">Detalles</button>
                        <button onClick={() => this.cerrarCaja(dato)} type="button" className="btn btn-danger btn-sm mr-1">Cerrar Caja</button>
                    </div>
                </li>)
        })
    }
    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Cajas</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-3">Descripcion - Estado</div>
                                    <div className="col-md-2">Fecha pertura</div>
                                    <div className="col-md-2">Fecha Cierre</div>
                                    <div className="col-md-3">Montos</div>
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
                            <CajaForm idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>                        
                    </div>
                </div>
            </div>
        )
    }
}