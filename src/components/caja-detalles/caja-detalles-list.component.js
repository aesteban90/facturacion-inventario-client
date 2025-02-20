import React, { Component } from 'react';
import axios from 'axios';
import CajaDetallesForm from './caja-detalles-form.component';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import UserContext  from '../../UserContext';

const { styleImpresion }  = require('../../utils/utils.js') 
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

        //console.log("updateList", id)

        await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/estado/"+id+"/Agregado")
        //await axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/estado/"+id+"/Facturado")
            .then(response => {
                //console.log("response detalles", response.data)
                this.setState({
                    datos: response.data,
                    loading: false
                }, () => console.log(this.state))                  
            })
            .catch(err => console.log(err))

       
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
                    caja, ultimo_vuelto: caja.ultimoVuelto
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

    printTicket = async (datos) => {       

        console.log('## datos', datos);
        
        const factura = {
            ruc: datos.cliente.ruc,
            razonSocial: datos.cliente.razonsocial,
            timbrado: datos.timbrado.numero,
            numeroComprobante: datos.timbrado.comprobante,
            recibido: parseInt((datos.recibido+"").replace(/\./gi,'')),
            total: parseInt((datos.total+"").replace(/\./gi,'')),
            vuelto: parseInt((datos.vuelto+"").replace(/\./gi,'')),
            user_created: datos.user_created,
            user_updated: datos.user_updated
        }
        
        await axios.post(process.env.REACT_APP_SERVER_URL + '/facturas/add',factura)
        .then( response => {
            let arrayIDsDetalles = [];
            this.state.datos.forEach(record => {
                const { _id } = record;
                arrayIDsDetalles.push(_id);
            })

            const cajaDetalles = { 
                ids: arrayIDsDetalles,
                factura: response.data.id
            };

            //Falta Obtener el ultimo numero del comprobante y actualizarlo
            //Guardando los detalles cargados como Facturado
             axios.post(process.env.REACT_APP_SERVER_URL + '/cajas-detalles/update-factura',cajaDetalles)
            .catch(err => console.log(err));

            //console.log('datos para inventario', this.state.datos)

            //Actualizando el stock de los productos
              axios.post(process.env.REACT_APP_SERVER_URL + '/inventarios/update-stock',this.state.datos)
            .catch(err => console.log(err));

        })
        .catch(err => console.log(err));
        
        console.log("## Operacion", datos.operacion)
        console.log("## Operacion > ", datos.operacion == "ImprimirFactura")

        if(datos.operacion == "ImprimirFactura"){
            //Imprimiendo la factura
            this.openPrintFactura(datos);
        }else{
            //Imprimiendo el ticket
            this.openPrintTicket(datos);
        }
        const caja = {
            id: this.state.caja._id,
            ultimoVuelto: parseInt((datos.vuelto+"").replace(/\./gi,''))
        }
          
        //Guardando ultimo vuelto en caja
        await axios.post(process.env.REACT_APP_SERVER_URL + '/cajas/ultimoVuelto',caja)
            .catch(err => console.log(err));

        //Limpiando los seleccionados
        this.setState({
            ultimo_vuelto: caja.ultimoVuelto,
            datos: []
        })
    }

    openPrintTicket = (datos) => {
        return new Promise((resolve, reject) => {

            const table = document.createElement('table');
            let headerRow = document.createElement('tr');
            let th = document.createElement('th');
            th.colSpan = 4;
            th.innerHTML = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp " + datos.timbrado.nombreEmpresa;
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');            
            th = document.createElement('td');
            th.colSpan = 4;
            th.innerHTML = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Comprobante" ;
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.textContent = "Detalle de la Compra";
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.textContent = "--------------------------------------";
            headerRow.appendChild(th);
            table.appendChild(headerRow);
            
            let totalCompra = 0;
            this.state.datos.forEach(record => {                
                const row1 = document.createElement('tr');
                const { inventario, cantidad, precio, total } = record;
                const data = [convertMiles(cantidad), convertMiles(precio), convertMiles(total)]
                totalCompra += total;

                let td = document.createElement('td');
                td.innerHTML = "# "+inventario.descripcion;
                row1.appendChild(td);
                
                const row2 = document.createElement('tr');
                td = document.createElement('td');
                td.innerHTML = convertMiles(cantidad) + " X " + convertMiles(precio) + " = " +  convertMiles(total) + "<br />";
                row2.appendChild(td);
                
                table.appendChild(row1);
                table.appendChild(row2);
            });

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.textContent = "--------------------------------------";
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.textContent = "Total = " + convertMiles(totalCompra);
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.textContent = "Vuelto = "+ convertMiles(this.state.ultimo_vuelto);
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            headerRow = document.createElement('tr');
            th = document.createElement('th');
            th.innerHTML = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Gracias Por Su Compra!";
            headerRow.appendChild(th);
            table.appendChild(headerRow);

            for (let index = 0; index < 9; index++) {
                headerRow = document.createElement('tr');
                th = document.createElement('th');
                th.innerHTML = "&nbsp";
                headerRow.appendChild(th);
                table.appendChild(headerRow);                
            }

            const printWindow = window.open('_blank', 'Print');
            printWindow.document.write(table.outerHTML);
            printWindow.print();

            resolve(printWindow.close());            
        });
        
    }

    openPrintFactura = (datos) => {
        return new Promise((resolve, reject) => {

            console.log('openPrintFactura.datos', datos);
            let iva_10_valor =  document.querySelector("#subtotal_iva10").innerHTML.replaceAll('.','') / 11;
            let iva_5_valor =  document.querySelector("#subtotal_iva5").innerHTML.replaceAll('.','') / 22;
            let iva_total_valor = convertMiles(iva_10_valor + iva_5_valor);

            const div_a4_sheet = document.createElement('div');
            const c1_contenido = document.createElement('table');
            const c1_contado = document.createElement('div');
            const c1_fecha_emision = document.createElement('div');
            const c1_ruc = document.createElement('div');
            const c1_razon_social = document.createElement('div');
            const c1_subtotales_5 = document.createElement('div');
            const c1_subtotales_10 = document.createElement('div');
            const c1_total_pagar = document.createElement('div');
            const c1_iva_5 = document.createElement('div');
            const c1_iva_10 = document.createElement('div');
            const c1_iva_total = document.createElement('div');

            const c2_contenido = document.createElement('table');
            const c2_contado = document.createElement('div');
            const c2_fecha_emision = document.createElement('div');
            const c2_ruc = document.createElement('div');
            const c2_razon_social = document.createElement('div');
            const c2_subtotales_5 = document.createElement('div');
            const c2_subtotales_10 = document.createElement('div');
            const c2_total_pagar = document.createElement('div');
            const c2_iva_5 = document.createElement('div');
            const c2_iva_10 = document.createElement('div');
            const c2_iva_total = document.createElement('div');

            div_a4_sheet.className = "a4-sheet";
            c1_contenido.className = "positioned_element c1_contenido";
            c1_contado.className = "positioned_element c1_contado_x";
            c1_fecha_emision.className = "positioned_element c1_fecha_emision";
            c1_ruc.className = "positioned_element c1_ruc";
            c1_razon_social.className = "positioned_element c1_razon_social";
            c1_subtotales_5.className = "positioned_element c1_subtotales_5";
            c1_subtotales_10.className = "positioned_element c1_subtotales_10";
            c1_total_pagar.className = "positioned_element c1_total_pagar";
            c1_iva_5.className = "positioned_element c1_iva_5";
            c1_iva_10.className = "positioned_element c1_iva_10";
            c1_iva_total.className = "positioned_element c1_iva_total";

            c2_contenido.className = "positioned_element c2_contenido";
            c2_contado.className = "positioned_element c2_contado_x";
            c2_fecha_emision.className = "positioned_element c2_fecha_emision";
            c2_ruc.className = "positioned_element c2_ruc";
            c2_razon_social.className = "positioned_element c2_razon_social";
            c2_subtotales_5.className = "positioned_element c2_subtotales_5";
            c2_subtotales_10.className = "positioned_element c2_subtotales_10";
            c2_total_pagar.className = "positioned_element c2_total_pagar";
            c2_iva_5.className = "positioned_element c2_iva_5";
            c2_iva_10.className = "positioned_element c2_iva_10";
            c2_iva_total.className = "positioned_element c2_iva_total";

            const fechaActual = new Date();
            const dia = fechaActual.getDate();
            const mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11
            const anio = fechaActual.getFullYear();

            c1_contado.textContent = "X";
            c1_fecha_emision.textContent = `${dia}/${mes}/${anio}`;
            c1_ruc.textContent = datos.cliente.ruc+"-"+datos.cliente.div;
            c1_razon_social.textContent = datos.cliente.razonsocial;
            c1_subtotales_5.textContent = document.querySelector("#subtotal_iva5").innerHTML;
            c1_subtotales_10.textContent = document.querySelector("#subtotal_iva10").innerHTML;
            c1_total_pagar.textContent = convertMiles(datos.total);
            c1_iva_5.textContent = convertMiles(iva_5_valor);
            c1_iva_10.textContent = convertMiles(iva_10_valor);
            c1_iva_total.textContent = iva_total_valor;

            c2_contado.textContent = "X";
            c2_fecha_emision.textContent = `${dia}/${mes}/${anio}`;
            c2_ruc.textContent = datos.cliente.ruc+"-"+datos.cliente.div;
            c2_razon_social.textContent = datos.cliente.razonsocial;
            c2_subtotales_5.textContent = document.querySelector("#subtotal_iva5").innerHTML;
            c2_subtotales_10.textContent = document.querySelector("#subtotal_iva10").innerHTML;
            c2_total_pagar.textContent = convertMiles(datos.total);
            c2_iva_5.textContent = convertMiles(iva_5_valor);
            c2_iva_10.textContent = convertMiles(iva_10_valor);
            c2_iva_total.textContent = iva_total_valor;

            div_a4_sheet.appendChild(c1_contado);
            div_a4_sheet.appendChild(c1_fecha_emision);
            div_a4_sheet.appendChild(c1_ruc);
            div_a4_sheet.appendChild(c1_razon_social);
            div_a4_sheet.appendChild(c1_subtotales_5);
            div_a4_sheet.appendChild(c1_subtotales_10);
            div_a4_sheet.appendChild(c1_total_pagar);
            div_a4_sheet.appendChild(c1_iva_5);
            div_a4_sheet.appendChild(c1_iva_10);
            div_a4_sheet.appendChild(c1_iva_total);

            div_a4_sheet.appendChild(c2_contado);
            div_a4_sheet.appendChild(c2_fecha_emision);
            div_a4_sheet.appendChild(c2_ruc);
            div_a4_sheet.appendChild(c2_razon_social);
            div_a4_sheet.appendChild(c2_subtotales_5);
            div_a4_sheet.appendChild(c2_subtotales_10);
            div_a4_sheet.appendChild(c2_total_pagar);
            div_a4_sheet.appendChild(c2_iva_5);
            div_a4_sheet.appendChild(c2_iva_10);
            div_a4_sheet.appendChild(c2_iva_total);
            
            console.log('this.state.datos',this.state.datos);

            this.state.datos.forEach(record => {
                const row = document.createElement('tr');
                const { cantidad, inventario, precio, total } = record;
                const iva10 = (inventario.tipoImpuesto == 0 ? convertMiles(total) : "");
                const iva5 = (inventario.tipoImpuesto == 1 ? convertMiles(total) : "");
                const excentas = (inventario.tipoImpuesto == 2 ? convertMiles(total) : "");
                const data = [convertMiles(cantidad), inventario.descripcion , convertMiles(precio), excentas, iva5, iva10]
                
                data.forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
                
                // Crear una copia del row para c1_contenido
                const rowCopy1 = row.cloneNode(true); // Clona el nodo
                c1_contenido.appendChild(rowCopy1);

                // Crear otra copia del row para c2_contenido
                const rowCopy2 = row.cloneNode(true); // Clona el nodo
                c2_contenido.appendChild(rowCopy2);

            });

            div_a4_sheet.appendChild(c1_contenido);
            div_a4_sheet.appendChild(c2_contenido);

            console.log(div_a4_sheet);

            const printWindow = window.open('', 'Print', 'height=600,width=800');
            printWindow.document.write(div_a4_sheet.outerHTML);
            printWindow.document.write(`
            <style>body {
                margin:0;
                padding:0;
                box-sizing:border-box
            }
            .a4_sheet {
                height:210mm;
                width:297mm;
                padding:20mm;
                position:relative;
                background-color:#fff
            }
            .positioned_element {
                position:absolute;
                font-size:12px
            }
            .c1_contado_x {
                top: 58mm;
                left: 144mm;
                width: 4mm;
                font-weight: bold;
            }            
            .c1_fecha_emision {
                top: 58mm;
                left: 46mm;
                width: 130mm;
            }
            .c1_ruc {
                top: 65mm;
                left: 28mm;
                width: 40mm;
            }
            .c1_razon_social {
                top: 72mm;
                left: 58mm;
                width: 95mm;
            }            
            .c1_subtotales_5 {
                top: 222mm;
                left: 128mm;
                width: 15mm;
                text-align: right;
            }
            .c1_subtotales_10,.c1_total_pagar {
                left: 142mm;
                width: 18mm;
                text-align: right;
            }
            .c1_subtotales_10 {
                top: 222mm;
            }
            .c1_total_pagar {
                top: 230mm;
            }
            .c1_iva_10,.c1_iva_5 {
                width: 19mm;
                top: 237mm;
            }
            .c1_iva_5 {
                left: 60mm;
            }
            .c1_iva_10 {
                left: 89mm;
            }
            .c1_iva_total {
                top: 237mm;
                left: 130mm;
                width: 30mm;
            }

            .c2_contado_x {
                top: 58mm;
                left: 320mm;
                width: 4mm;
                font-weight: bold;
            }
            .c2_fecha_emision {
                top: 58mm;
                left: 223mm;
                width: 130mm;
            }
            .c2_ruc {
                top: 65mm;
                left: 204mm;
                width: 40mm;
            }
            .c2_razon_social {
                top: 72mm;
                left: 232mm;
                width: 95mm;
            }
            .c2_subtotales_5 {
                top: 222mm;
                left: 309mm;
                width: 15mm;
                text-align: right;
            }
            .c2_subtotales_10 {
                top: 222mm;
                left: 326mm;
                width: 18mm;
                text-align: right;
            }
            .c2_total_pagar {
                top: 230mm;
                left: 311mm;
                width: 33mm;
                text-align: right;
            }
            .c2_iva_10,.c2_iva_5,table tr td:nth-child(4),table tr td:nth-child(5) {
                width:15mm
            }
            .c2_iva_5 {
                top: 237mm;
                left: 236mm;
            }
            .c2_iva_10 {
                top: 237mm;
                left: 266mm;
            }
            .c2_iva_total {
                top: 237mm;
                left: 306mm;
                width: 30mm;
            }

            .c1_contenido {
                top: 94mm;
                left: 28mm;
                width: 140mm;
            }
            .c2_contenido {
                top: 94mm;
                left: 206mm;
                width: 140mm;
            }

            table tr td:first-child {
                width: 10mm;
                padding-right: 1mm;
            }
            table td:nth-child(2) {
                padding-left: 6mm;
                width: 46mm;
            }
            table tr td:nth-child(3) {
                width:13mm
            }
            table tr td:nth-child(6) {
                width:18mm
            }
            table tr td:first-child,table tr td:nth-child(3),table tr td:nth-child(4),table tr td:nth-child(5),
            table tr td:nth-child(6) {
                text-align:right
            }
            </style>
            `)

            //printWindow.print();
            //resolve(printWindow.close());            
        });

        /*
        <style>body{margin:0;padding:0;box-sizing:border-box}.a4_sheet{height:210mm;width:297mm;padding:20mm;position:relative;background-color:#fff}
            .positioned_element{position:absolute;font-size:12px}.c1_contado_x{top:43mm;left:122mm;width:4mm}.c2_contado_x{top:43mm;left:262mm;width:4mm}
            .c1_fecha_emision{top:43mm;left:38mm;width:130mm}.c1_ruc{top:48mm;left:24mm;width:40mm}.c1_razon_social{top:53mm;left:47mm;width:95mm}
            .c2_fecha_emision{top:43mm;left:180mm;width:130mm}.c2_ruc{top:48mm;left:165mm;width:40mm}.c2_razon_social{top:53mm;left:188mm;width:95mm}
            .c1_contenido{top:74mm;left:28mm;width:113mm}.c2_contenido{top:74mm;left:169mm;width:113mm}.c1_subtotales_5{top:175mm;left:108mm;width:15mm;text-align:right}
            .c1_subtotales_10,.c1_total_pagar{left:124mm;width:18mm;text-align:right}.c1_subtotales_10{top:175mm}.c1_total_pagar{top:180mm}
            .c1_iva_10,.c1_iva_5{width:15mm;top:186mm}.c1_iva_5{left:48mm}.c1_iva_10{left:70mm}.c1_iva_total{top:186mm;left:101mm;width:30mm}
            .c2_subtotales_5{top:175mm;left:250mm;width:15mm;text-align:right}.c2_subtotales_10{top:175mm;left:264mm;width:18mm;text-align:right}
            .c2_total_pagar{top:180mm;left:249mm;width:33mm;text-align:right}.c2_iva_10,.c2_iva_5,table tr td:nth-child(4),table tr td:nth-child(5){width:15mm}
            .c2_iva_5{top:186mm;left:188mm}.c2_iva_10{top:186mm;left:211mm}.c2_iva_total{top:186mm;left:241mm;width:30mm}
            table tr td:first-child{width:12mm;padding-right:1mm}table td:nth-child(2){padding-left:1mm;width:40mm}table tr td:nth-child(3){width:13mm}
            table tr td:nth-child(6){width:18mm}table tr td:first-child,table tr td:nth-child(3),table tr td:nth-child(4),table tr td:nth-child(5),
            table tr td:nth-child(6){text-align:right}</style>
        */
       
        
    }
    
    datalist(){
        return this.state.datos.map((dato, index) => {    
            return (
                <li className="list-productos list-group-item" key={dato._id}>
                    <div className="col-md-3">
                        {(index+1) + "- "+dato.inventario.descripcion}
                    </div>
                    <div className="col-md-1 text-right">{convertMiles(dato.cantidad)}</div>
                    <div className="col-md-1 text-right">{convertMiles(dato.precio)}</div>
                    <div className="col-md-2 text-right">{dato.inventario.tipoImpuesto == 2 && convertMiles(dato.total)}</div>{/* Excentas*/}
                    <div className="col-md-2 text-right">{dato.inventario.tipoImpuesto == 1 && convertMiles(dato.total)}</div>{/* IVA 5%*/}
                    <div className="col-md-2 text-right">{dato.inventario.tipoImpuesto == 0 && convertMiles(dato.total)}</div>{/* IVA 10%*/}
                    <div className="col-md-1 text-right">
                        {/* <button onClick={() => this.updateData(dato)} type="button" className="btn btn-light btn-sm mr-1"><FontAwesomeIcon icon={faEdit} /></button> */}
                        <button onClick={() => this.deleteData(dato)} type="button" className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                </li>)
        })
    }
    datalistTotales(){
        let precio = 0;
        let total = 0;
        let subtotal_excentas = 0;
        let subtotal_iva5 = 0;
        let subtotal_iva10 = 0;
        let cantidad = 0;
        this.state.datos.map((dato) => {    
            cantidad += dato.cantidad;
            precio += dato.precio;
            total += dato.total ;
            if(dato.inventario.tipoImpuesto == 0) subtotal_iva10 += dato.total;
            if(dato.inventario.tipoImpuesto == 1) subtotal_iva5 += dato.total;
            if(dato.inventario.tipoImpuesto == 2) subtotal_excentas += dato.total;
        })
        
        return (
            <div className="card-footer font-weight-bold">     
                <div className="row">
                    <div className="col-md-5 text-right">Sub-Totales</div>
                    <div id="subtotal_excentas" className="col-md-2 text-right">{convertMiles(subtotal_excentas)}</div>
                    <div id="subtotal_iva5" className="col-md-2 text-right">{convertMiles(subtotal_iva5)}</div>
                    <div id="subtotal_iva10" className="col-md-2 text-right">{convertMiles(subtotal_iva10)}</div>
                </div>
                <div className="row h4 text-success">
                    <div className="col-md-9 text-right">Total a Pagar</div>                    
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
                        <h2 className='text-center'>{'Ultimo Vuelto '+ (this.state.ultimo_vuelto ? convertMiles(this.state.ultimo_vuelto) : '0')+' Gs.'}</h2>                        
                    </div>
                    
                    <div className="col-md-8">
                        <button onClick={() => this.irCaja()} type="button" className="btn btn-warning btn-sm mb-1"><FontAwesomeIcon icon={faArrowLeft} /> Volvar a Caja</button>
                        <div className="card">                            
                            <div className="card-header">                                
                                <div className="card-title row mb-0">  
                                    <div className="col-md-3"># - Decripcion</div>
                                    <div className="col-md-1 text-right">Cantidad</div>
                                    <div className="col-md-1 text-right">Precio</div>
                                    <div className="col-md-2 text-right">Excentas</div>
                                    <div className="col-md-2 text-right">5%</div>
                                    <div className="col-md-2 text-right">10%</div>
                                    <div className="col-md-1 text-right">
                                        {/* <button onClick={() => this.createData("NEW")} type="button" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} /> Nuevo</button> */}
                                    </div>                                 
                                </div>
                            </div>
                            <ul id="list" className="list-group overflow-auto">
                                {this.state.loading  ? 
                                    <Spinner animation="border" variant="primary" style={{margin:"25px",alignSelf:"center"}}/> 
                                :
                                    this.state.datos.length === 0 ?
                                        <div className="col-md-11 text-center m-3">Sin registros encontrados</div>
                                    :
                                        this.datalist()
                                }                                
                            </ul>            
                            {this.state.datos.length > 0 ? this.datalistTotales() : ''}         
                        </div>
                    </div>
                    <div className="col-md-4">                        
                        <CajaDetallesForm caja={this.state.caja} onParentPrintTicket={this.printTicket} onUpdateParentList={this.updateList} onUpdateParentUltimoVuelto={this.updateUltimoVuelto}/>
                    </div>
                </div>
            </div>
        )
    }
}

