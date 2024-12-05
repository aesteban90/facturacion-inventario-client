import React, { Component } from 'react';
import axios from 'axios';
import UserContext  from '../../UserContext';
import { NumericFormat } from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

export default class InventarioForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            codigo:'',
            descripcion: '',
            cantidad: '0',
            precio_costo: '0',
            precio_venta: '0',
            notificar_cantidad_minima: '0',
            tipoImpuestoOptions: [],
            tipoImpuestoSelected: {},
            user_created: '',
            user_updated: '',            
            textButton:'Crear',
            titleForm: 'Crear Inventario',
            idUpdate: 'NEW'
        };        
    }
     //Metodo que se ejecuta antes del render
     componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name}) 

        let options = [];
        options.push({value:0,label:"IVA 10%"});
        options.push({value:1,label:"IVA 5%"});
        options.push({value:2,label:"Excentas"});

        this.setState({user_created: currentUser.name, user_updated: currentUser.name, tipoImpuestoOptions: options}) 
        
    }

    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(process.env.REACT_APP_SERVER_URL + "/inventarios/"+this.props.idUpdate)
                .then(response => {
                    console.log("INVENTARIO", response.data)
                    this.setState({
                        codigo: response.data.codigo,    
                        descripcion: response.data.descripcion,   
                        notificar_cantidad_minima: response.data.notificar_cantidad_minima,
                        cantidad: response.data.cantidad,   
                        precio_costo: response.data.precio_costo,   
                        precio_venta: response.data.precio_venta,
                        tipoImpuestoSelected: this.state.tipoImpuestoOptions[response.data.tipoImpuesto],
                        textButton:'Editar',
                        titleForm: 'Editar Inventario'
                    })

                    console.log('state',this.state)
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    codigo:'',
                    descripcion:'',
                    notificar_cantidad_minima:'0',
                    cantidad: '0',
                    precio_costo: '0',
                    precio_venta: '0',
                    tipoImpuestoSelected: {},
                    textButton:'Crear',
                    titleForm: 'Crear Inventario',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }    
    
    onChangeCodigo = (e) => {this.setState({codigo: e.target.value})}
    onChangeDescripcion = (e) => {this.setState({descripcion: e.target.value})}
    onChangePrecioCosto = (e) => {this.setState({precio_costo: e.target.value})}
    onChangePrecioVenta = (e) => {this.setState({precio_venta: e.target.value})}
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value})}  
    onChangeNotificarCantidadMinima = (e) => {this.setState({notificar_cantidad_minima: e.target.value})}

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

  
    onChangeTipoImpuesto = (selectedOption) => {this.setState({tipoImpuestoSelected: selectedOption})}
    
    onSubtmit = (e) => {
        e.preventDefault();
        if(this.props.idUpdate === "NEW" || this.props.idUpdate === "" ){
            const inventario = {
                codigo: this.state.codigo,
                descripcion: this.state.descripcion,
                cantidad: parseInt(this.state.cantidad.replace(/\./gi,'')),
                precio_costo: parseInt(this.state.precio_costo.replace(/\./gi,'')),
                precio_venta: parseInt(this.state.precio_venta.replace(/\./gi,'')),
                tipoImpuesto: this.state.tipoImpuestoSelected.value,
                notificar_cantidad_minima: parseInt(this.state.notificar_cantidad_minima.replace(/\./gi,'')),
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }

            console.log('Inventario',inventario)
            axios.post(process.env.REACT_APP_SERVER_URL + '/inventarios/add',inventario)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));

                this.setState({
                    codigo:'',
                    descripcion: '',
                    cantidad: '0',
                    precio_costo: '0',
                    precio_venta: '0',
                    tipoImpuestoSelected: {},
                    notificar_cantidad_minima: '0',
                    textButton:'Crear',
                    titleForm: 'Crear Inventario',
                    idUpdate:'NEW'
                })
                   
        }else{
            const inventario = {
                codigo: this.state.codigo,
                descripcion: this.state.descripcion,
                tipoImpuesto: this.state.tipoImpuestoSelected.value,
                cantidad: this.state.cantidad && parseInt((this.state.cantidad+"").replace(/\./gi,'')),
                notificar_cantidad_minima: this.state.notificar_cantidad_minima && parseInt((this.state.notificar_cantidad_minima+"").replace(/\./gi,'')),
                precio_costo: this.state.precio_costo && parseInt((this.state.precio_costo+"").replace(/\./gi,'')),
                precio_venta: parseInt((this.state.precio_venta+"").replace(/\./gi,'')),
                user_updated: this.state.user_updated
            }
            axios.post(process.env.REACT_APP_SERVER_URL+ '/inventarios/update/'+this.state.idUpdate,inventario)
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
                            <div className="form-group col-md-12 bd-callout bd-callout-info">
                                <h4 id="data-attributes-for-individual-tooltips">Informaciones para el Registro</h4>
                                <p>Para registrar un producto propio colocar solo hasta <b>5 caracteres de numeros</b>, para los demas solo registrar con el lector de codigo de barras.</p>
                                Ejemplos:
                                <ul className='pl-4'>
                                    <li>
                                        Codigo Propio: 12345
                                    </li>
                                    <li>
                                        Codigo definido del producto: 75489654213547
                                    </li>
                                </ul>
                                    
                            </div>
                            <div className="form-group col-md-12">
                                <label>Codigo Barra : </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    maxLength={13} 
                                    required 
                                    className="form-control"
                                    value={this.state.codigo}
                                    onChange={this.onChangeCodigo}
                                />
                            </div>   
                            <div className="form-group col-md-12">
                                <label>Descripcion: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.descripcion}
                                    onChange={this.onChangeDescripcion} 
                                />
                            </div>      
                            <div className="form-group col-md-6">
                                <label>Notificar en cantidad minima: </label>
                                <input type="text" 
                                    required
                                    className="form-control"
                                    value={this.state.notificar_cantidad_minima}
                                    onChange={this.onChangeNotificarCantidadMinima}
                                />
                            </div>
                            <div className="form-group col-md-6">
                                <label>Tipo de Impuesto: </label>
                                <Select
                                    value={this.state.tipoImpuestoSelected}
                                    options={this.state.tipoImpuestoOptions}
                                    onChange={this.onChangeTipoImpuesto}
                                    required/>
                            </div>                            
                            
                            <div className="form-group col-md-4">
                                <label>Cantidad: </label>
                                <NumericFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>  
                            <div className="form-group col-md-4">
                                <label>Precio Costo: </label>
                                <NumericFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precio_costo}
                                    onChange={this.onChangePrecioCosto}
                                    required
                                />
                            </div> 
                            <div className="form-group col-md-4">
                                <label>Precio Venta: </label>
                                <NumericFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precio_venta}
                                    onChange={this.onChangePrecioVenta}
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
