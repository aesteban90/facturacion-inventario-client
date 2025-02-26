import React, {Component} from 'react';
import axios from 'axios';
import InventarioForm from './inventario-form.component';
import { Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
const { convertMiles } = require('../../utils/utils.js')

export default class InventarioList extends Component{
    constructor(props){
        super(props);
        this.state = {
            datos: [],
            loading: true,
            idUpdate: '',
            didUpdate: true,
            tipoImpuestoOptions: []
        }
        this.datalist = this.datalist.bind(this);
    }

    updateList = async () => {
        
        await axios.get(process.env.REACT_APP_SERVER_URL + "/inventarios/")
            .then(response => {
                console.log(response.data)
                this.setState({
                    datos: response.data,
                    loading: false
                })  
            })
            .catch(err => console.log(err))

        await new Promise(resolve => setTimeout(() => {
            window.paginar('list-group','list-group-item',true);
            resolve(false);
        }, 500));

        let options = [];
        options.push({value:0,label:"IVA 10%",class: "badge-success"});
        options.push({value:1,label:"IVA 5%",class: "badge-warning"});
        options.push({value:2,label:"Excentas",class: "badge-light"});

        this.setState({tipoImpuestoOptions: options});        

    }

    componentDidMount(){this.updateList()}
    componentDidUpdate(){}

    deleteData = async (jsondatos) => {
        await axios.delete(process.env.REACT_APP_SERVER_URL + "/inventarios/"+jsondatos._id)
            .then(res => {
                console.log('res', res.data)
                if(res.data.delete === "relacionado"){
                    alert("No se puede eliminar, existen compras relacionadas a este inventario")
                }else{
                    this.setState({
                        datos: this.state.datos.filter(el => el._id !== jsondatos._id)
                    });
                }
            })
            .catch(err => console.log(err))        
    }

    updateData = (jsondatos) => {this.setState({idUpdate: jsondatos._id})}
    createData = (id) => {this.setState({idUpdate: id})}

    datalist(){
        
        return this.state.datos.map(dato => {
            return (
                <li className="list-group-item" key={dato._id}>
                    <div className="col-md-4">{dato.codigo}<br/>
                        <span className="details-user-actions">
                            <b> Creado por: </b>{dato.user_created}
                            <b> Actualidado por: </b>{dato.user_updated}
                        </span>
                    </div>
                    <div className="col-md-3">{dato.descripcion} 
                        <br />
                        <span className={`p-2 badge ${this.state.tipoImpuestoOptions[dato.tipoImpuesto] && this.state.tipoImpuestoOptions[dato.tipoImpuesto].class } `}> 
                        {this.state.tipoImpuestoOptions[dato.tipoImpuesto] && this.state.tipoImpuestoOptions[dato.tipoImpuesto].label }</span>
                        
                    </div>
                    <div className="col-md-3 details-consumision">
                        <b>Cantidad:</b> <span>{convertMiles(dato.cantidad)}</span><br/>
                        <b>Costo:</b> <span>{convertMiles(dato.precio_costo)} Gs.</span><br />
                        <b>Venta:</b> <span>{convertMiles(dato.precio_venta)} Gs.</span>
                    </div>
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
                <h2>Inventarios</h2>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-3">Codigo</div>
                                    <div className="col-md-7">Descripcion</div>
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
                        <InventarioForm idUpdate={this.state.idUpdate} onUpdateParentList={this.updateList}/>
                    </div>
                </div>
            </div>
        )
    }
}