import React, {Component} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import MaskedInput from 'react-maskedinput';
import Chart from "react-apexcharts";
const { convertMiles } = require('../../utils/utils.js')

export default class Dashboard extends Component{
    constructor(props){
        super(props);
        this.state = {
            month: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'],
            dataPerYear: {},         
            reporteVentas_totalMes:'',
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
        this.productosPorMes();
    }
    onChangeReporteVentasFechaMes = (date) => {this.setState({reporteVentas_fechaMes: date}, () => this.reportePorMes())}    
    onChangeReporteVentasFechaDia = (date) => {this.setState({reporteVentas_fechaDia: date}, () => this.reportePorDia())}    
    productosMasVendidos =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/topMasVendidos/1")
            .then(res => console.log(res.data))
            .catch(err => console.log(err))
    }
    
    productosPorMes =  () => {
        axios.get(process.env.REACT_APP_SERVER_URL + "/cajas-detalles/totalesPorMes/1")
            .then(res => {
                this.setState({dataPerYear: res.data}, () => this.reportePorDia())
            })
            .catch(err => console.log(err))
    }

    reportePorDia = () =>{
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
            }
        };
        let reporteVentas_series = [
            {name: "Totales",data: totalesPerDay}
        ];

        this.setState({reporteVentas_options, reporteVentas_series, reporteVentas_totalMes: 'Gs. '+convertMiles(totalMes)})
    }

    reportePorMes = () =>{
        document.querySelector('#datepicker_dia').classList.add('d-none')
        document.querySelector('#datepicker_mes').classList.remove('d-none')

        let month = [];
        let totalesPerMonth = [];        
        let totalAnho = 0;
        
        this.state.dataPerYear.map(dataYear => {
            dataYear.monthlyusage.map(dataMonth => {
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
            }
        };
        let reporteVentas_series = [
            {name: "Totales",data: totalesPerMonth}
        ];

        this.setState({reporteVentas_options, reporteVentas_series, reporteVentas_totalAnho: 'Gs. '+convertMiles(totalAnho)})
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
                                    <div className="col-md-4">Reporte de Ventas Por dia</div>
                                    <div className="col-md-8 text-right">
                                        <button type="button" className="btn btn-light mr-3" onClick={() => this.reportePorDia()} >Dia</button>
                                        <button type="button" className="btn btn-light mr-3" onClick={() => this.reportePorMes()}>Mes</button>
                                        <button type="button" className="btn btn-light mr-3">Año</button>
                                    </div>
                                </div>
                            </div>
                            <div className="reportVentasPorDia card-body">
                                <div className='row'>
                                    <div className="col-md-9 d-flex">
                                        <div className="d-flex">
                                            <p className="d-flex flex-column">
                                                <span id='total_mes' className="text-bold text-lg"><b>{this.state.reporteVentas_totalMes}</b></span>
                                                <span ><b>Totales de Ventas</b></span>
                                            </p>                                    
                                        </div>
                                    </div>
                                    <div id='datepicker_dia' className="col-md-3">
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
                                    <div id='datepicker_mes' className="col-md-3 d-none">
                                        <DatePicker     
                                            className="form-control" 
                                            locale="esp"
                                            required
                                            dateFormat="yyyy"
                                            showYearPicker
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
                                        width="500"
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