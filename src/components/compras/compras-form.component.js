import React, {Component} from 'react';
import axios from 'axios';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import UserContext  from '../../UserContext';
import { NumericFormat } from 'react-number-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const { convertMiles } = require('../../utils/utils.js')

export default class ComprasForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            numerofactura: '',
            fechaCompra: new Date(),
            inventarioSelected: {},
            inventarioOptions: [],
            proveedorSelected: {},
            proveedorOptions: [],
            cantidad: '',
            costo: '',
            total: '',
            user_created: '',
            user_updated: '',
            textButton:'Crear',
            titleForm: 'Crear Compra',
            idUpdate: 'NEW'
        };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){        
        if(this.state.idUpdate !== this.props.idUpdate ){
            this.setState({ idUpdate: this.props.idUpdate});
            if(this.props.idUpdate !== "NEW" && this.props.idUpdate !== "" ){
                axios.get(process.env.REACT_APP_SERVER_URL  + "/compras/"+this.props.idUpdate)
                .then(response => {
                    this.setState({
                        numerofactura: response.data.numerofactura,
                        inventarioSelected: this.state.inventarioOptions.filter(el => el.value === response.data.inventario)[0],
                        proveedorSelected: this.state.proveedorOptions.filter(el => el.value === response.data.proveedor)[0],
                        cantidad: convertMiles(response.data.cantidad),
                        costo: convertMiles(response.data.costo),
                        total: convertMiles(response.data.total),
                        textButton:'Editar',
                        titleForm: 'Editar Compra'
                    })
                })
                .catch(err => console.log(err));
            }else{
                this.setState({
                    numerofactura: '',
                    inventario: this.state.inventarioOptions[0],
                    proveedor: this.state.proveedorOptions[0],
                    cantidad: '',
                    costo: '',
                    total: '',
                    textButton:'Crear',
                    titleForm: 'Crear Compra',
                    idUpdate: this.props.idUpdate
                });
            }
        }
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name}) 

        this.getInventariosOptions(); //Obtener Inventarios
        this.getProveedoresOptions(); //Obtener Proveedores       
    }    

    getInventariosOptions = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL  + "/Inventarios").then(response => {
            let options = [];
            if(response.data.length > 0 ){
                response.data.forEach(element => {options.push({value:element._id,label:element.descripcion +" | "+element.codigo})});
                this.setState({inventarioSelected: options[0], inventarioOptions: options});
            }else{
                this.setState({inventarioSelected: {}, inventarioOptions: []});
            }
        }).catch(err => console.log(err))        
    }
    getProveedoresOptions = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL  + "/Proveedores").then(response => {
            let options = [];
            if(response.data.length > 0 ){
                response.data.forEach(element => {options.push({value:element._id,label:element.razonsocial})});
                this.setState({proveedorSelected: options[0], proveedorOptions: options});
            }else{
                this.setState({proveedorSelected: {}, proveedorOptions: []});
            }
        }).catch(err => console.log(err))        
    }
    onChangeFechaCompra = (date) => {this.setState({fechaCompra: date})}    
    onChangeNumeroFactura = (e) => {this.setState({numerofactura: e.target.value})}
    onChangeTotal = (e) => {this.setState({total: e.target.value})}
    onChangeInventario = (selectedOption) => {this.setState({inventarioSelected: selectedOption})}
    onChangeProveedor = (selectedOption) => {this.setState({proveedorSelected: selectedOption})}
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value}, () => this.calcularTotal())}
    onChangeCosto = (e) => {this.setState({costo: e.target.value}, () => this.calcularTotal())}
    calcularTotal = () => {
        let total = 0;
        total = parseInt(this.state.cantidad.replace(/\./gi,'')) * parseInt(this.state.costo.replace(/\./gi,''));
        this.setState({total})
    }
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
            const compras = {
                numerofactura: this.state.numerofactura,
                inventario: this.state.inventarioSelected.value,
                proveedor: this.state.proveedorSelected.value,
                fecha_compra: this.state.fechaCompra,
                cantidad: this.state.cantidad,
                costo: this.state.costo,
                total: this.state.total,
                user_created: this.state.user_created,
                user_updated: this.state.user_updated
            }
            
            axios.post(process.env.REACT_APP_SERVER_URL  + '/compras/add',compras)
                .then(res => this.showNotification(true))
                .catch(err => this.showNotification(false));
                this.setState({
                    numerofactura: '',
                    inventarioSelected: this.state.inventarioOptions[0],
                    proveedorSelected: this.state.proveedorOptions[0],
                    cantidad: '',
                    costo: '',
                    total: '',
                    textButton:'Crear',
                    titleForm: 'Crear Compra',
                    idUpdate:'NEW'
                })   
                                
        }else{            
            const compras = {
                numerofactura: this.state.numerofactura,
                inventario: this.state.inventarioSelected.value,
                proveedor: this.state.proveedorSelected.value,
                fecha_compra: this.state.fechaCompra,
                cantidad: this.state.cantidad,
                costo: (this.state.costo+"").replace(/\./gi,''),
                total: (this.state.total+"").replace(/\./gi,''),
                user_updated: this.state.user_updated
            }

            axios.post(process.env.REACT_APP_SERVER_URL  + '/compras/update/'+this.state.idUpdate,compras)
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
                                <label>Factura: </label>
                                <input type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required
                                    className="form-control"
                                    value={this.state.numerofactura}
                                    onChange={this.onChangeNumeroFactura}
                                />
                            </div>      
                            <div className="form-group col-md-12">
                                <label>Inventario: </label>
                                <Select               
                                    noOptionsMessage={() => <a href="/Inventario">Cargar Inventario</a>}
                                    value={this.state.inventarioSelected} 
                                    options={this.state.inventarioOptions} 
                                    onChange={this.onChangeInventario}  
                                    required/>
                            </div>                          
                            <div className="form-group col-md-12">
                                <label>Proveedor: </label>
                                <Select               
                                    noOptionsMessage={() => <a href="/Proveedores">Cargar Proveedor</a>}
                                    value={this.state.proveedorSelected} 
                                    options={this.state.proveedorOptions} 
                                    onChange={this.onChangeProveedor}                                    
                                    required/>
                            </div>
                            <div className="form-group col-md-12">
                                <label>Fecha Compra: </label>                                    
                                <DatePicker     
                                    className="form-control" 
                                    locale="esp"
                                    required
                                    dateFormat="dd/MM/yyyy"
                                    selected={this.state.fechaCompra}
                                    onChange={this.onChangeFechaCompra}
                                    showYearDropdown 
                                    customInput={
                                        <MaskedInput mask="11/11/1111" placeholder="mm/dd/yyyy" />
                                    }                                           
                                /> 
                            </div>
                            <div className="form-group col-md-4">
                                <label>Cantidad: </label>
                                <NumericFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    required
                                />
                            </div>  
                            <div className="form-group col-md-4">
                                <label>Costo: </label>
                                <NumericFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.costo}
                                    onChange={this.onChangeCosto}
                                    required
                                />
                            </div> 
                            <div className="form-group col-md-4">
                                <label>Total: </label>
                                <NumericFormat 
                                    disabled
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.total}
                                    onChange={this.onChangeTotal}
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
