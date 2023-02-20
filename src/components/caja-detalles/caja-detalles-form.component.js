import React, {Component} from 'react';
import axios from 'axios';
import UserContext  from '../../UserContext';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import { getDiv } from '../../utils/utils.js'

export default class CajaDetallesForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = {  
            ruc:'',
            div:'',
            razonsocial:'',
            timbrado: {},
            inventarioSelected: {},
            inventarioOptions: [],
            clienteSelected: {},
            clienteOptions: [],            
            caja:{},
            cliente: {},
            codigoBarra:'',
            cantidad:'',
            precio:'',
            total:'',
            producto:'',
            pagamiento_recibido:'',
            pagamiento_total:'',
            pagamiento_vuelto:'',
            user_created: '',
            user_updated: '',
            textButton:'Agregar',
            titleForm: 'Agregar Detalle',
            idUpdate: 'NEW'
        };        
    }
    
    //Metodo que se ejecuta antes del render
    componentDidMount(){
        const currentUser = this.context.currentUser;
        this.setState({user_created: currentUser.name, user_updated: currentUser.name}) 
   
        this.getTimbrado();//Obtiene los datos para la factura
        this.getInventariosOptions(); //Obtener Inventarios
        this.getClientesOptions(); //Obtiene los Clientes

        setInterval(() => {            
            if (document.activeElement != this._input){
                this._input.focus();
            };
            if (document.activeElement != this._inputRecibido){
                this._inputRecibido.focus();
            };

        }, "1000");
    }    
    getTimbrado = () =>{
        axios.get(process.env.REACT_APP_SERVER_URL + "/timbrados/activado/0")
        .then(response => {
            this.setState({
                timbrado: response.data,
            })
        })
    }

    getClientesOptions = () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/clientes")
        .then(response => {
            let options = [];
            let optiondefault = {};
            response.data.forEach(element => {
                if(element.ruc === '000000'){
                     optiondefault = {value:element,label:element.ruc+"-"+element.div +" "+element.razonsocial +" | CI:"+element.ruc.replace(/\./gi,'')};
                }
                options.push({value:element,label:element.ruc+"-"+element.div +" "+element.razonsocial +" | CI:"+element.ruc.replace(/\./gi,'')});
            });
            this.setState({
                clienteOptions: options,    
                clienteSelected: optiondefault,
                ruc: optiondefault.value.ruc,
                div: optiondefault.value.div,
                razonsocial: optiondefault.value.razonsocial          
            });
        })
        .catch(err => console.log(err))
    }
    getInventariosOptions = async () => {
        await axios.get(process.env.REACT_APP_SERVER_URL  + "/Inventarios").then(response => {
            let options = [];
            options.push({value:'undefined',label:'', codigo: '', precio: 0})
            if(response.data.length > 0 ){
                response.data.forEach(element => {
                    options.push({value:element._id,label:element.descripcion, codigo: element.codigo, precio: element.precio_venta})
                });
                this.setState({inventarioSelected: options[0], inventarioOptions: options});
            }else{
                this.setState({inventarioSelected: {}, inventarioOptions: []});
            }
        }).catch(err => console.log(err))        
    }
    onKeyPressBuscarCliente = (e) =>{       
        if (e.key === "-") {
            document.querySelector('#PanelVueltos').classList.remove("d-none");
            document.querySelector('#PanelCliente').classList.add("d-none");
            this._inputRecibido.focus();//Enfoca en el input del vuelto
            e.preventDefault();//Para que no cargue el key
        }
        if (e.key === "+") {
            e.preventDefault();//Para que no cargue el key
            //Generar la factura e imprimir

            this.submitFactura()
        }
    }
    onKeyPressRecibido = (e) =>{   
        if (e.key === "-") {
            document.querySelector('#PanelProductos').classList.remove("d-none");
            document.querySelector('#PanelVueltos').classList.add("d-none");
            this._input.focus();//Enfoca en el input del vuelto
            e.preventDefault();//Para que no cargue el key
        }
        if (e.key === "+" || e.key === "Enter") {
            //Actualiza el ultimo vuelto
            this.props.onUpdateParentUltimoVuelto(this.state.pagamiento_vuelto);

            document.querySelector('#PanelVueltos').classList.add("d-none");
            document.querySelector('#PanelCliente').classList.remove("d-none");            
            this._inputBuscarCliente.focus();//Enfoca en el input del ruc cliente
            e.preventDefault();//Para que no cargue el key
        }
    }
    onKeyPressCodigoBarra = (e) =>{       
        if (e.key === "+") {
            document.querySelector('#PanelProductos').classList.add("d-none");
            document.querySelector('#PanelVueltos').classList.remove("d-none");
            this._inputRecibido.focus();//Enfoca en el input del vuelto
            e.preventDefault();//Para que no cargue el key

            this.setState({
                pagamiento_total: document.querySelector('#totales_total').innerText.replace(/\./gi,'')
            })
        }
        if (e.key === "-")  e.preventDefault();//Para que no cargue el key
    }
    onChangeCodigoBarra = (e) => {
        this.setState({codigoBarra: e.target.value})
        let codigobarra = e.target.value;

        if (codigobarra.length === 13){
            let cod_inv =  parseInt(codigobarra.substring(2,7));
            let indexInventario = undefined;
            this.state.inventarioOptions.forEach((element, index) => {
                let codigo = parseInt(element.codigo);
                if( codigo === cod_inv){
                    indexInventario = index;
                    return false;
                }
            })
            //Si encuentra el producto en el inventario
            if(indexInventario){
                let cantidad =  parseInt(codigobarra.substring(7,12)) / 1000;
                let inventario = this.state.inventarioOptions[indexInventario];
                let precio = inventario.precio;
                let total = parseInt(inventario.precio * cantidad);
                
                this.setState({
                    inventarioSelected: inventario,
                    producto: inventario.label,
                    cantidad,
                    precio,
                    total
                })
            }
        }else{
            this.setState({
                inventarioSelected: this.state.inventarioOptions[0],
                producto: this.state.inventarioOptions[0].label,
                cantidad: '',
                precio: '',
                total: ''
            })
        }
    }
    onChangeCantidad = (e) => {this.setState({cantidad: e.target.value})}
    onChangePrecio = (e) => {this.setState({precio: e.target.value})}
    onChangeTotal = (e) => {this.setState({total: e.target.value})}
    onChangeProducto = (e) => {this.setState({producto: e.target.value})}
    onChangeRecibido = (e) => {
        let recibido = parseInt(e.target.value.replace(/\./gi,''));
        let total = this.state.pagamiento_total;
        let vuelto = recibido - total;

        this.setState({
            pagamiento_recibido: e.target.value,
            pagamiento_vuelto: vuelto
        }
    )}
    onChangeRazonSocial = (e) => {this.setState({razonsocial: e.target.value})}
    onChangeRuc = (e) => {
        this.setState({
            ruc: e.target.value,
            div: getDiv(e.target.value)
        })
    }  
    onChangeCliente = (selectedOption) => {
        this.setState({
            clienteSelected: selectedOption,
            ruc: selectedOption.value.ruc,
            div: selectedOption.value.div,
            razonsocial: selectedOption.value.razonsocial
        })
    }


    showNotification(isSuccess){   
        /* 
        document.querySelector('#alert').classList.replace('hide','show');
        if(isSuccess === true){
            document.querySelector('#alert').classList.replace('alert-warning','alert-success');
            document.querySelector('#alert #text').innerHTML = '<strong>Exito!</strong> Los datos han sido actualizados.'
        }else{
            document.querySelector('#alert').classList.replace('alert-success','alert-warning');
            document.querySelector('#alert #text').innerHTML = '<strong>Error!</strong> Contacte con el administrador.'
        }
        */
        //Enfocar el input
        this._input.focus(); 
        //actualizar Lista
        this.props.onUpdateParentList('true');
        //setTimeout(function(){  document.querySelector('#alert').classList.replace('show','hide'); }, 3000);
    }

    onSubtmit = (e) => {
        e.preventDefault();        
        const detalleCaja = {
            caja: this.props.caja._id,
            inventario: this.state.inventarioSelected.value,
            cantidad: this.state.cantidad,
            precio: this.state.precio,
            total: this.state.total,
            estado: 'Agregado',
            user_created: this.state.user_created,
            user_updated: this.state.user_updated
        }
        
        axios.post(process.env.REACT_APP_SERVER_URL + '/cajas-detalles/add',detalleCaja)
            .then(res => this.showNotification(true))
            .catch(err => this.showNotification(false));

            this.setState({
                codigoBarra:'',
                inventarioSelected: this.state.inventarioOptions[0],
                producto: '',
                cantidad: '',
                precio: '',
                total: ''
            })             
    }   

    onSubtmitCliente = (e) => {
        e.preventDefault();    
        this.submitFactura()    
    }   

    submitFactura = () =>{
        alert('imprimir');
           
        const factura = {            
            caja: this.props.caja,
            cliente: this.state.clienteSelected.value,
            timbrado: this.state.timbrado,
            recibido: this.state.pagamiento_recibido,
            total: this.state.pagamiento_total,
            vuelto: this.state.pagamiento_vuelto,
            user_created: this.state.user_created,
            user_updated: this.state.user_updated
        }

        //console.log("Enviando al Parent para la impresion");
        this.props.onParentPrintFactura(factura);

        /*
        axios.post(process.env.REACT_APP_SERVER_URL + '/facturas/add',factura)
                .then(res => {
                    console.log('response factura', res)
                    this.showNotification(true)
                })
                .catch(err => this.showNotification(false));
        this.setState({
            codigoBarra:'',
            inventarioSelected: this.state.inventarioOptions[0],
            producto: '',
            cantidad: '',
            precio: '',
            total: ''
        })  */

    }
    
    render(){
        return(
        <div>
            <div id="PanelProductos" className="container"> 
                <h3>{this.state.titleForm}</h3>
                <form onSubmit={this.onSubtmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Codigo Barra: </label>
                                <input id="codigobarra" type="text" 
                                    autoFocus={true}
                                    ref={c => (this._input = c)}
                                    required
                                    maxLength={13} 
                                    className="form-control"
                                    value={this.state.codigoBarra}
                                    onChange={this.onChangeCodigoBarra} 
                                    onKeyPress={this.onKeyPressCodigoBarra}
                                />
                            </div>
                            <div className="form-group col-md-12">
                                <label>Producto: </label>
                                <input type="text" 
                                    disabled 
                                    className="form-control"
                                    value={this.state.producto}
                                    onChange={this.onChangeProducto} 
                                />
                            </div> 
                            <div className="form-group col-md-3">
                                <label>Cantidad: </label>
                                <NumericFormat                                     
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.cantidad}
                                    onChange={this.onChangeCantidad}
                                    disabled
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <label>Precio: </label>
                                <NumericFormat
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.precio}
                                    onChange={this.onChangePrecio}
                                    disabled
                                />
                            </div>
                            <div className="form-group col-md-5">
                                <label>Total: </label>
                                <NumericFormat 
                                    thousandSeparator = "."
                                    decimalSeparator = ","
                                    className="form-control"
                                    value={this.state.total}
                                    onChange={this.onChangeTotal}
                                    disabled
                                />
                            </div>
                        </div>
                    <div className="form-group d-none">
                        <button type="submit" className="btn btn-warning d-none"></button>
                    </div>
                </form>
            </div>

            <div id="PanelVueltos" className="container d-none"> 
                <h3>Vueltos</h3>
                <form >
                    <div className="row">
                        <div className="form-group col-md-12">
                            <label>Recibido: </label>
                            <NumericFormat     
                                autoFocus={true}                                
                                getInputRef={c => (this._inputRecibido = c)}                                
                                thousandSeparator = "."
                                decimalSeparator = ","
                                className="form-control"
                                value={this.state.pagamiento_recibido}
                                onChange={this.onChangeRecibido}
                                onKeyPress={this.onKeyPressRecibido}
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Total: </label>
                            <NumericFormat                                     
                                thousandSeparator = "."
                                decimalSeparator = ","
                                className="form-control"
                                value={this.state.pagamiento_total}
                                disabled
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Vuelto: </label>
                            <NumericFormat                                     
                                thousandSeparator = "."
                                decimalSeparator = ","
                                className="form-control"
                                value={this.state.pagamiento_vuelto}
                                disabled
                            />
                        </div>
                    </div>
                </form>
            </div>

            <div id="PanelCliente" className="container d-none">                 
                <form onSubmit={this.onSubtmitCliente}>
                    <div className="row">
                        <div className="form-group col-md-12">
                            <label>Buscar Cliente Registrado: </label>
                            <Select           
                                autoFocus={true}
                                ref={c => (this._inputBuscarCliente = c)}
                                noOptionsMessage={() => 'Sin resultados'}
                                value={this.state.clienteSelected} 
                                options={this.state.clienteOptions} 
                                onChange={this.onChangeCliente}  
                                onKeyDown={this.onKeyPressBuscarCliente}                      
                                required/>
                        </div>   
                        <hr className="solid"></hr>         
                        <h3>Cliente</h3>            
                        <div className="row">
                        <div className="form-group col-md-6">
                            <label>Ruc: </label>
                            <NumericFormat 
                                thousandSeparator = "."
                                decimalSeparator = "_"                               
                                required
                                className="form-control"
                                value={this.state.ruc}
                                onChange={this.onChangeRuc}
                            />
                        </div> 
                        <div className="form-group col-md-6">
                            <label>DIV: </label>
                            <input type="number" 
                                disabled
                                id="idDiv"
                                className="form-control"
                                value={this.state.div}                                    
                            />
                        </div>                          
                        <div className="form-group col-md-12">
                            <label>Razon Social: </label>
                            <input type="text" 
                                required                                    
                                className="form-control"
                                value={this.state.razonsocial}
                                onChange={this.onChangeRazonSocial}
                            />
                        </div> 
                        </div>     
                    </div>                      

                    <div className="form-group d-none">
                        <button type="submit" className="btn btn-warning"></button>
                    </div>                                
                </form>
            </div>
        </div>
        )
    }
}
