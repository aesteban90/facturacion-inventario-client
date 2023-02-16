import React, { Component } from 'react';
import axios from 'axios';
import CajaDetallesForm from './caja-detalles-form.component';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import UserContext  from '../../UserContext';
const { convertMiles } = require('../../utils/utils.js')

export default class CajaDetallesList extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            ultimo_vuelto: '',
            loading: true,
            caja:{},
            idUpdate: '',
            didUpdate: true
        }
        this.datalist = this.datalist.bind(this);
    }
    irCaja = () =>{
        window.location.href = "./Caja";
    }
    updateUltimoVuelto = (ultimo_vuelto) =>{
        this.setState({
            ultimo_vuelto
        })
    }

    updateList = async () => {
        const queryParameters = new URLSearchParams(window.location.search);
        const id = queryParameters.get("id");

        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/estado/"+id+"/Agregado")
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

    componentDidMount(){
        document.querySelector('.content-wrapper').style.marginLeft = "5px";
        this.updateList(); //Obteniendo los Detalles Caja

        this.getCaja(); //Obtener Caja
    }

    getCaja = async () => {
        const queryParameters = new URLSearchParams(window.location.search);
        const id = queryParameters.get("id");
        await axios.get(process.env.REACT_APP_SERVER_URL  + "/cajas/"+id)
            .then(response => {
                const caja = response.data;
                this.setState({
                    caja
                })                  
            })
            .catch(err => console.log(err))      
    }

    deleteData = async (jsondatos) => {
        await axios.delete(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/"+jsondatos._id)
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
            return (
                <li className="list-productos list-group-item" key={dato._id}>
                    <div className="col-md-4">
                        {(index+1) + "- "+dato.inventario.descripcion}
                    </div>
                    <div className="col-md-2 text-right">{convertMiles(dato.cantidad)}</div>
                    <div className="col-md-2 text-right">{convertMiles(dato.precio)}</div>
                    <div className="col-md-2 text-right">{convertMiles(dato.total)}</div>
                    <div className="col-md-2 text-right">
                        {/* <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button> */}
                        <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </li>)
        })
    }

    printFactura = (factura) => {
        
        axios.post(process.env.REACT_APP_SERVER_URL + '/facturas/update-factura',factura)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));

        console.log("Factura", factura);
        console.log("Imprimir los detalles", this.state.datos);
    }



    datalistTotales(){
        let precio = 0;
        let total = 0;
        let cantidad = 0;
        this.state.datos.map((dato) => {    
            cantidad += dato.cantidad
            precio += dato.precio
            total += dato.total 
        })
        
        
        return (
            <div className="card-footer font-weight-bold">     
                <div className="row">
                    <div className="col-md-4 text-right">Totales</div>
                    <div className="col-md-2 text-right">{convertMiles(cantidad)}</div>
                    <div className="col-md-2 text-right">{convertMiles(precio)}</div>
                    <div id="totales_total" className="col-md-2 text-right">{convertMiles(total)}</div>
                </div>
            </div>
        )
        
    }

    render(){        
        return(            
            <div className="content-wrapper" id="content">                
                <div className="row">
                    <div className="col-md-3">
                        <h2>{this.state.caja.cajaConf && 'Detalle ' + this.state.caja.cajaConf.descripcion}</h2>                        
                    </div>
                    <div className="col-md-5">
                        <h2 className='text-center'>{'Ultimo Vuelto '+ convertMiles(this.state.ultimo_vuelto)+' Gs.'}</h2>                        
                    </div>
                    
                    <div className="col-md-8">
                        <button onClick={() => this.irCaja()} type="button" className="btn btn-warning btn-sm mb-1"><FontAwesomeIcon icon={faArrowLeft} /> Volvar a Caja</button>
                        <div className="card">                            
                            <div className="card-header">                                
                                <div className="card-title row mb-0">  
                                    <div className="col-md-4"># - Decripcion</div>
                                    <div className="col-md-2 text-right">Cantidad</div>
                                    <div className="col-md-2 text-right">Precio</div>
                                    <div className="col-md-2 text-right">Total</div>
                                    <div className="col-md-2 text-right">
                                        {/* <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button> */}
                                    </div>                                 
                                </div>
                            </div>
                            <ul id="list" className="list-group overflow-auto" style={{height:'500px'}}>
                                {this.state.loading  ? 
                                    <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                                :
                                    this.state.datos.length === 0 ?
                                        <div className="col-md-12 text-center m-3">Sin registros encontrados</div>
                                    :
                                        this.datalist()
                                }                                
                            </ul>            
                            {this.state.datos.length > 0 ? this.datalistTotales() : ''}         
                        </div>
                    </div>
                    <div className="col-md-4">                        
                        <CajaDetallesForm caja={this.state.caja} onParentPrintFactura={this.printFactura} onUpdateParentList={this.updateList} onUpdateParentUltimoVuelto={this.updateUltimoVuelto}/>
                    </div>
                </div>
            </div>
        )
    }
}