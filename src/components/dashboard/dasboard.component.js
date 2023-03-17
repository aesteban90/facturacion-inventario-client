import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Chart from "react-apexcharts";
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
const { convertMilesSinDecimales } = require('../../utils/utils.js')

export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.state = {
            month: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'],
            reporteVentas: {},         
            reporteVentas_totales_ventas:'',
            reporteVentas_totales_productos: '',
            reporteVentas_fechaDia: new Date(),
            reporteVentas_fechaMes: new Date(),
            reporteVentas_options: {},
            reporteVentas_series: [],
            reporteProductos:[],
            reporteProductos_options: {},
            reporteProductos_series: [],
            datosCargadosSelected: {},
            datosCargadosOptions: [],
            chartProductos_height: '600px'
        };
    }

    componentDidMount(){      
        this.productosPorFecha();
        this.productosMasVendidos();
    }
    onChangeReporteVentasFechaMes = (date) => {this.setState({reporteVentas_fechaMes: date}, () => this.reportePorMes())}    
    onChangeReporteVentasFechaDia = (date) => {this.setState({reporteVentas_fechaDia: date}, () => this.reportePorDia())}    
    onChangeDatosCargados = (selectedOption) => {
        this.setState({datosCargadosSelected: selectedOption})
        this.changeDatosCargados(selectedOption)
    }

    changeDatosCargados = (selectedOption) =>{
        if(selectedOption.label.indexOf("Dia")>-1){
            this.reporteProductosPorDia(selectedOption.value)
        }else if(selectedOption.label.indexOf("Mes")>-1){
            this.reporteProductosPorMes(selectedOption.value)
        }else if(selectedOption.label.indexOf("Año")>-1){
            this.reporteProductosPorAnho(selectedOption.value)
        }
    }

    productosMasVendidos =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/topMasVendidos/1")
            .then(res => {
                this.setState({reporteProductos: res.data}, () => {this.reporteProductosPorDia()})
            })
            .catch(err => console.log(err))
    }
    
    productosPorFecha =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/totalesPorMes/1")
            .then(res => {
                this.setState({reporteVentas: res.data}, () => {this.reportePorDia(); document.querySelector('#dia-outlined').checked = true})
            })
            .catch(err => console.log(err))
    }

     reportePorDia = () =>{
        document.querySelector('#datepicker_dia').classList.remove('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')
        
        let datosCargadosOptions = [];
        let datosCargadosSelected = {};
        let day = [];
        let totalesPerDay = [];
        let totalMes = 0;
        let yearSelected = this.state.reporteVentas_fechaDia.getFullYear();
        let monthSelected = this.state.reporteVentas_fechaDia.getMonth()+1;
        this.state.reporteVentas.map(dataYear => {
            dataYear._id.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                dataMonth.month === monthSelected && dataMonth.dailyusage.map(dataDayli => {
                    datosCargadosOptions.push({value: dataDayli.day, label: 'Dia '+dataDayli.day})
                    totalesPerDay.push(dataDayli.totalPrecio)
                    day.push(dataDayli.day)
                    totalMes += dataDayli.totalPrecio;
                })
            })
        })
        datosCargadosSelected = datosCargadosOptions[0];
        this.changeDatosCargados(datosCargadosSelected)

        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},                
            xaxis: {categories: day},
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return "Gs. " + convertMilesSinDecimales(val)
                    }
                }
            },
            dataLabels: {
                enabled: false
            }
        };
        let reporteVentas_series = [
            {name: "Totales",data: totalesPerDay}
        ];
        
        this.setState({datosCargadosSelected, datosCargadosOptions, reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMilesSinDecimales(totalMes)})
    }

    reportePorMes = () =>{
        document.querySelector('#datepicker_dia').classList.add('d-none')
        document.querySelector('#datepicker_mes').classList.remove('d-none')

        let datosCargadosOptions = [];
        let datosCargadosSelected = {};
        let month = [];
        let totalesPerMonth = [];        
        let totalAnho = 0;
        let yearSelected = this.state.reporteVentas_fechaMes.getFullYear();

        this.state.reporteVentas.map(dataYear => {
            dataYear._id.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                let totales = 0;                
                dataMonth.dailyusage.map(dataDayli => {
                    totales += dataDayli.totalPrecio;
                    totalAnho += dataDayli.totalPrecio;
                })
                totalesPerMonth.push(totales)
                month.push(this.state.month[dataMonth.month-1])
                datosCargadosOptions.push({value: dataMonth.month, label: 'Mes '+this.state.month[dataMonth.month-1]})
            })
        })

        datosCargadosSelected = datosCargadosOptions[0];
        this.changeDatosCargados(datosCargadosSelected)

        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},
            xaxis: {categories: month},
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return "Gs. " + convertMilesSinDecimales(val)
                    }
                }
            },            
            dataLabels: {
                enabled: false
            }
        };
        let reporteVentas_series = [
            {name: "Totales",data: totalesPerMonth}
        ];

        this.setState({datosCargadosSelected, datosCargadosOptions, reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMilesSinDecimales(totalAnho)})
    }
    
    reportePorAnho = () =>{
        document.querySelector('#datepicker_dia').classList.add('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')

        let datosCargadosOptions = [];
        let datosCargadosSelected = {};
        let year = [];
        let totalesPerYear = [];        
        let totalAnho = 0;
        
        this.state.reporteVentas.map(dataYear => {
            let totales = 0;
            dataYear.monthlyusage.map(dataMonth => {                
                dataMonth.dailyusage.map(dataDayli => {
                    totales += dataDayli.totalPrecio;
                    totalAnho += dataDayli.totalPrecio;
                })                
            })
            totalesPerYear.push(totales)
            year.push(dataYear._id.year)
            datosCargadosOptions.push({value: dataYear._id.year, label: 'Año ' + dataYear._id.year})
        })

        datosCargadosSelected = datosCargadosOptions[0];
        this.changeDatosCargados(datosCargadosSelected)

        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},
            xaxis: {categories: year},
            yaxis: {labels: {formatter: function(val) {return "Gs. " + convertMilesSinDecimales(val)}}},            
            dataLabels: {enabled: false}
        };
        let reporteVentas_series = [{name: "Totales",data: totalesPerYear}];

        this.setState({datosCargadosSelected, datosCargadosOptions, reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMilesSinDecimales(totalAnho)})
    }

    reporteProductosPorDia(daySelected){
        
        document.querySelector('#datepicker_dia').classList.remove('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')
        let containsData = false;
        let products = [];
        let totalesPerDay = [];
        let totalProducto = 0;
        let yearSelected = this.state.reporteVentas_fechaDia.getFullYear();
        let monthSelected = this.state.reporteVentas_fechaDia.getMonth()+1;
             
        this.state.reporteProductos.map(product => {
            containsData = false;
            product.yearlyusage.map(dataYear => {
                dataYear.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                    dataMonth.month === monthSelected && dataMonth.dailyusage.map(dataDayli => {
                        if(daySelected === undefined){daySelected = dataDayli.day;}                        
                        if(dataDayli.day === daySelected){
                            totalesPerDay.push(dataDayli.totalPrecio)
                            totalProducto += dataDayli.totalPrecio;   
                            containsData = true;             
                        }                       
                    })
                })
            })

            if(containsData){
                products.push(product._id.inventario[0])                
            }
        })

        let reporteProductos_options = {
            chart: {id: "basic-bar-2",type: 'bar'}, 
            plotOptions: {bar: {horizontal: true}},               
            xaxis: {categories: products,labels: {formatter: function(val) {return "Gs. " + convertMilesSinDecimales(val)}}},
            yaxis: {labels: {formatter: function(val) {return "" + convertMilesSinDecimales(val)}}},
            dataLabels: {enabled: false}
        };
        let reporteProductos_series = [
            {name: "Totales",data: totalesPerDay}
        ];        
        
        this.setState({chartProductos_height: '600px',reporteProductos_options, reporteProductos_series, reporteVentas_totales_productos: 'Gs. '+convertMilesSinDecimales(totalProducto)})
    }

    reporteProductosPorMes(monthSelected){
        document.querySelector('#datepicker_dia').classList.remove('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')
        let containsData = false;
        let products = [];
        let totalProductoPerMonth = 0;
        let totalesPerMonth = [];
        let totalProducto = 0;
        let yearSelected = this.state.reporteVentas_fechaDia.getFullYear();
             
        this.state.reporteProductos.map(product => {
            totalProductoPerMonth = 0;
            containsData = false;
            product.yearlyusage.map(dataYear => {
                dataYear.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                    if(monthSelected === undefined){monthSelected = dataMonth.month;}
                    dataMonth.month === monthSelected && dataMonth.dailyusage.map(dataDayli => {                                                
                        totalProductoPerMonth += dataDayli.totalPrecio;
                        totalProducto += dataDayli.totalPrecio;   
                        containsData = true;
                    })
                })
            })

            if(containsData){
                totalesPerMonth.push(totalProductoPerMonth)
                products.push(product._id.inventario[0])
            }
        })

        let reporteProductos_options = {
            chart: {id: "basic-bar-2",type: 'bar'}, 
            plotOptions: {bar: {horizontal: true}},               
            xaxis: {categories: products,labels: {formatter: function(val) {return "Gs. " + convertMilesSinDecimales(val)}}},
            yaxis: {labels: {formatter: function(val) {return "" + convertMilesSinDecimales(val)}}},
            dataLabels: {enabled: false}
        };
        let reporteProductos_series = [
            {name: "Totales",data: totalesPerMonth}
        ];        

        this.setState({chartProductos_height: '1000px', reporteProductos_options, reporteProductos_series, reporteVentas_totales_productos: 'Gs. '+convertMilesSinDecimales(totalProducto)})
    }

    reporteProductosPorAnho(yearSelected){
        document.querySelector('#datepicker_dia').classList.remove('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')
        let containsData = false;
        let products = [];
        let totalProductoPerYear = 0;
        let totalesPerYear = [];
        let totalProducto = 0;
             
        this.state.reporteProductos.map(product => {
            totalProductoPerYear = 0;
            containsData = false;
            product.yearlyusage.map(dataYear => {
                if(yearSelected === undefined){yearSelected = dataYear.year;}
                dataYear.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {                    
                    dataMonth.dailyusage.map(dataDayli => {                                                
                        totalProductoPerYear += dataDayli.totalPrecio;
                        totalProducto += dataDayli.totalPrecio;   
                        containsData = true;
                    })
                })
            })

            if(containsData){
                totalesPerYear.push(totalProductoPerYear)
                products.push(product._id.inventario[0])
            }
        })

        let reporteProductos_options = {
            chart: {id: "basic-bar-2",type: 'bar', height: '1300px'}, 
            plotOptions: {bar: {horizontal: true}},               
            xaxis: {categories: products,labels: {formatter: function(val) {return "Gs. " + convertMilesSinDecimales(val)}}},
            yaxis: {labels: {formatter: function(val) {return "" + convertMilesSinDecimales(val)}}},
            dataLabels: {enabled: false}
        };
        let reporteProductos_series = [
            {name: "Totales",data: totalesPerYear}
        ];        

        this.setState({chartProductos_height: '1500px', reporteProductos_options, reporteProductos_series, reporteVentas_totales_productos: 'Gs. '+convertMilesSinDecimales(totalProducto)})
    }


    render(){       
        return(
            <div className="content-wrapper" id="content">
                <h2>Dashboard</h2>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-4">Reporte de Ventas</div>
                                    <div className="col-md-8 text-right">
                                        <input type="radio" onClick={() => this.reportePorDia()} className="btn-check" name="options-outlined" id="dia-outlined" autoComplete="off" />
                                        <label className="btn btn-outline" htmlFor="dia-outlined">Dia</label>
                                        <input type="radio" onClick={() => this.reportePorMes()} className="btn-check" name="options-outlined" id="mes-outlined" autoComplete="off" />
                                        <label className="btn btn-outline" htmlFor="mes-outlined">Mes</label>
                                        <input type="radio" onClick={() => this.reportePorAnho()} className="btn-check" name="options-outlined" id="anho-outlined" autoComplete="off" />
                                        <label className="btn btn-outline" htmlFor="anho-outlined">Año</label>
                                    </div>
                                </div>
                            </div>
                            <div className="reportVentasPorDia card-body">
                                <div className='row'>
                                    <div className="col-md-10 d-flex">
                                        <div className="d-flex">
                                            <h3 id='totales_ventas' className="text-bold text-lg"><b>Total: {this.state.reporteVentas_totales_ventas}</b></h3>
                                        </div>
                                    </div>
                                    <div id='datepicker_dia' className="col-md-2">
                                        <DatePicker     
                                            className="form-control" 
                                            locale="esp"
                                            required
                                            dateFormat="MMMM yyyy"
                                            showMonthYearPicker
                                            selected={this.state.reporteVentas_fechaDia}
                                            onChange={this.onChangeReporteVentasFechaDia}                                                                                   
                                        /> 
                                    </div>
                                    <div id='datepicker_mes' className="col-md-2 d-none">
                                        <DatePicker                                             
                                            className="form-control" 
                                            locale="esp"
                                            required
                                            dateFormat="yyyy"
                                            showYearPicker={true}
                                            selected={this.state.reporteVentas_fechaMes}
                                            onChange={this.onChangeReporteVentasFechaMes}                                                                                   
                                        /> 
                                    </div>
                                </div>
                                <div className="position-relative mb-4">
                                    <Chart
                                        options={this.state.reporteVentas_options}
                                        series={this.state.reporteVentas_series}
                                        type="bar"
                                        height={"300px"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 mt-3">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title row mb-0">  
                                    <div className="col-md-12">Productos Vendidos</div>                                    
                                </div>
                            </div>
                            <div className="reportVentasPorProducto card-body">
                                <div className=" row col-md-12">
                                    <div className="form-group col-md-4">
                                        <label>Datos Cargados: </label>
                                        <Select               
                                            noOptionsMessage={() => 'Cajas no Configuradas'}
                                            value={this.state.datosCargadosSelected} 
                                            options={this.state.datosCargadosOptions} 
                                            onChange={this.onChangeDatosCargados}  
                                            required/>
                                    </div>  
                                    <div className="form-group col-md-8">
                                        <h4 id='totales_ventas' className="text-bold text-lg"><b>Total: {this.state.reporteVentas_totales_productos}</b></h4>
                                    </div>
                                </div>
                                <div className="position-relative mb-4">
                                    <Chart
                                        id="chartProductos"
                                        options={this.state.reporteProductos_options}
                                        series={this.state.reporteProductos_series}
                                        type="bar"
                                        height={this.state.chartProductos_height}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        )
    }
}