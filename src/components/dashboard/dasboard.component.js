import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Chart from "react-apexcharts";
import 'react-datepicker/dist/react-datepicker.css';
const { convertMiles } = require('../../utils/utils.js')

export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.state = {
            month: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'],
            dataPerYear: {},         
            reporteVentas_totales_ventas:'',
            reporteVentas_fechaDia: new Date(),
            reporteVentas_fechaMes: new Date(),
            reporteVentas_options: {
                chart: {id: "basic-bar",type: 'bar'},                
                xaxis: {categories: []}
            },
            reporteVentas_series: [
                {name: "Totales",data: []}
            ]
        };
    }

    async componentDidMount(){      
        this.productosMasVendidos();
        this.productosPorFecha();
    }
    onChangeReporteVentasFechaMes = (date) => {this.setState({reporteVentas_fechaMes: date}, () => this.reportePorMes())}    
    onChangeReporteVentasFechaDia = (date) => {this.setState({reporteVentas_fechaDia: date}, () => this.reportePorDia())}    
    productosMasVendidos =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/topMasVendidos/1")
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
    }
    
    productosPorFecha =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/totalesPorMes/1")
            .then(res => {
                this.setState({dataPerYear: res.data}, () => {this.reportePorDia(); document.querySelector('#dia-outlined').checked = true})
            })
            .catch(err => console.log(err))
    }

    reportePorDia = () =>{
        document.querySelector('#datepicker_dia').classList.remove('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')
        let day = [];
        let totalesPerDay = [];
        let totalMes = 0;
        let yearSelected = this.state.reporteVentas_fechaDia.getFullYear();
        let monthSelected = this.state.reporteVentas_fechaDia.getMonth()+1;
        this.state.dataPerYear.map(dataYear => {
            dataYear._id.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                dataMonth.month === monthSelected && dataMonth.dailyusage.map(dataDayli => {
                    totalesPerDay.push(dataDayli.totalPrecio)
                    day.push(dataDayli.day)
                    totalMes += dataDayli.totalPrecio;
                })
            })
        })
        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},                
            xaxis: {categories: day},
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return "Gs. " + convertMiles(val)
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

        this.setState({reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMiles(totalMes)})
    }

    reportePorMes = () =>{
        document.querySelector('#datepicker_dia').classList.add('d-none')
        document.querySelector('#datepicker_mes').classList.remove('d-none')

        let month = [];
        let totalesPerMonth = [];        
        let totalAnho = 0;
        let yearSelected = this.state.reporteVentas_fechaMes.getFullYear();

        this.state.dataPerYear.map(dataYear => {
            dataYear._id.year === yearSelected && dataYear.monthlyusage.map(dataMonth => {
                let totales = 0;
                dataMonth.dailyusage.map(dataDayli => {
                    totales += dataDayli.totalPrecio;
                    totalAnho += dataDayli.totalPrecio;
                })
                totalesPerMonth.push(totales)
                month.push(this.state.month[dataMonth.month-1])
            })
        })
        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},
            xaxis: {categories: month},
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return "Gs. " + convertMiles(val)
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

        this.setState({reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMiles(totalAnho)})
    }
    
    reportePorAnho = () =>{
        document.querySelector('#datepicker_dia').classList.add('d-none')
        document.querySelector('#datepicker_mes').classList.add('d-none')

        let year = [];
        let totalesPerYear = [];        
        let totalAnho = 0;
        
        this.state.dataPerYear.map(dataYear => {
            let totales = 0;
            dataYear.monthlyusage.map(dataMonth => {                
                dataMonth.dailyusage.map(dataDayli => {
                    totales += dataDayli.totalPrecio;
                    totalAnho += dataDayli.totalPrecio;
                })                
            })
            totalesPerYear.push(totales)
            year.push(dataYear._id.year)
        })
        let reporteVentas_options = {
            chart: {id: "basic-bar",type: 'bar'},
            xaxis: {categories: year},
            yaxis: {
                labels: {
                    formatter: function(val) {
                        return "Gs. " + convertMiles(val)
                    }
                }
            },            
            dataLabels: {
                enabled: false
            }
        };
        let reporteVentas_series = [
            {name: "Totales",data: totalesPerYear}
        ];

        this.setState({reporteVentas_options, reporteVentas_series, reporteVentas_totales_ventas: 'Gs. '+convertMiles(totalAnho)})
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
                </div>                
            </div>
        )
    }
}