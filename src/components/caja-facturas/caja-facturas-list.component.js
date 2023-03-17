import React, {Component} from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const { convertMiles } = require('../../utils/utils.js')

export default class CajaFacturasList extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            didUpdate: true
        }
    }

    updateList = async() => {
        const queryParameters = new URLSearchParams(window.location.search);
        const id = queryParameters.get("id");

        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/facturas/"+id)
        .then(response => {
            this.setState({
                datos: response.data
            })
        })
        .catch(err => console.log(err))
        
        //Pagina la lista
        //window.paginar('list-group','list-group-item',true);
    }

    componentDidMount(){
        //console.log('params', this.props.match.params.id)

        this.updateList()
    }

    datalistDetalle(dato){
        return dato.inventariousage.map((el, index) => {            
            const inventario = el.inventario[0];
            return (
                <div className="col-md-12 row"  key={index}>
                    <div className="col-md-2"></div>
                    <div className="col-md-4">{inventario.descripcion}</div>
                    <div className="col-md-2 text-right">{convertMiles(el.cantidad)}</div>
                    <div className="col-md-2 text-right">{convertMiles(el.precio)}</div>
                    <div className="col-md-2 text-right">{convertMiles(el.total)}</div>
                </div>
            )
        })
    }

    irCajas = () => {window.location = "Caja"}
   
    datalist(){
        console.log(this.state.datos)
        return this.state.datos.map((dato, index) => {            
            const factura = dato._id.factura[0];
            return (
                <li className="list-productos list-group-item " key={index}>
                    <div className="col-md-12"><b>Razon Social: {factura.razonSocial + " - Ruc: " + factura.ruc  } </b></div>
                    {this.datalistDetalle(dato)}                   
                </li>)
        })
    }

    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Facturacion</h2>
                <div className="row">
                    <div className="col-md-2 mb-2">
                        <button onClick={() => this.irCajas()} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faArrowLeft} /> Volver a Cajas</button>
                    </div>
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-3">Factura</div>
                                    <div className="col-md-7">Descripcion</div> 
                                </div>
                            </div>          
                            <input className="form-control inputsearch" type="search" placeholder="Busqueda (minimo 3 letras)..." />                 
                            <ul id="list" className="list-group">        
                                {this.datalist()}                       
                            </ul>                     
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}