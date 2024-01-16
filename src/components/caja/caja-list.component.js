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
        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas")
            .then(response => {
                this.setState({
                    datos: response.data,
                    loading: false
                })                  
            })
            .catch(err => console.log(err))

        //Pagina la lista
        //

        await new Promise(resolve => setTimeout(() => {
            window.paginar('list-group','list-group-item',true);
            resolve(false);
        }, 500));
    }

    detallesFacturas = (dato) =>{
        window.location.href = "/CajaFacturas?id="+dato._id
    }

    componentDidMount(){this.updateList();}
    detalles = (jsondatos) => {window.location = "CajaDetalles?id="+jsondatos._id}    
    createData = (id) => {this.setState({idUpdate: id})}
    cerrarCaja = async (jsondatos) => {
        //Cerrar Caja
        let total_cierre_caja = 0;
        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/estado/"+jsondatos._id+"/Facturado")
            .then(response => {
                console.log(response.data)

                response.data.map(data => {
                    total_cierre_caja += data.total
                })
            })
            .catch(err => console.log(err))

        jsondatos.estado = "Cerrado";
        jsondatos.montoCierre = total_cierre_caja;
        console.log('jsondatos',jsondatos)
        console.log('total_cierre_caja',total_cierre_caja)
        
        await axios.post(process.env.REACT_APP_SERVER_URL  + '/cajas/update/'+jsondatos._id,jsondatos)
            .then(() => {
                this.updateList();
            })
            .catch(err => alert(err));                    
    }
    datalist(){
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item" key={dato._id}>
                    <div className="col-md-3">{dato.cajaConf.descripcion} <br/>
                        <div className={`alert alert-success-estado ${dato.estado === "Abierto" ? "alert-success" : "alert-danger"} `}>{dato.estado}</div> </div>
                    <div className="col-md-2">{moment(dato.fechaApertura).format("DD/MM/YYYY HH:mm:ss")}</div>
                    <div className="col-md-2">{dato.fechaCierre && moment(dato.fechaCierre).format("DD/MM/YYYY HH:mm:ss")}</div>
                    <div className="col-md-3">
                        <b>Apertura:</b> {convertMiles(dato.montoApertura)+" Gs."} <br/>
                        <b>Cierre:</b> {dato.montoCierre && convertMiles(dato.montoCierre)+" Gs."}
                    </div>
                    {dato.estado === "Abierto" &&
                        <div className="col-md-2 text-right">
                            <button onClick={() => this.detalles(dato)} type="button" className="btn btn-success btn-sm mr-1 mb-1">Detalles</button>
                            <button onClick={() => this.cerrarCaja(dato)} type="button" className="btn btn-danger btn-sm mr-1">Cerrar Caja</button>
                        </div>
                    }
                    {dato.estado === "Cerrado" &&
                        <div className="col-md-2 text-right">
                            <button onClick={() => this.detallesFacturas(dato)} type="button" className="btn btn-light btn-sm mr-1 mb-1">Facturas</button>
                        </div>
                    }
                </li>)
        })
    }
    verificarCaja = (id) => {
        const isClosed = new Promise((resolve) => {
            const isClosed = this.state.datos.map(dato => {
                if(dato.cajaConf._id === id){
                    if(dato.estado === "Abierto"){
                        return false
                    }else{
                        return true
                    }
                }
            })
            resolve(isClosed[0])
        })

        return isClosed;
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
                            <CajaForm onUpdateParentList={this.updateList} onParentVerificarCaja={this.verificarCaja}/>                        
                    </div>
                </div>
            </div>
        )
    }
}