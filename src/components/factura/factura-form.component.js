import React, {Component} from 'react';
import UserContext  from '../../UserContext';
import FacturaTemplate from '../../imagens/FacturaTemplate.png'

export default class FacturaForm extends Component{
    static contextType = UserContext;
    constructor(props){
        super(props);
        this.state = { };        
    }
    //Metodo que obtiene cualquier actualizacion de otros componentes donde fue llamado
    componentDidUpdate(){
    }

    //Metodo que se ejecuta antes del render
    componentDidMount(){
    }    

    
    onSubtmit = (e) => {
        e.preventDefault();
    }   
    
    render(){  
        return(
            <div> 
                <div style={{position:'absolute', fontSize: '17px'}}>
                    <span style={{position:'absolute', width: '250px', top:'263px', left:'230px'}}>20/04/2023</span>
                    <span style={{position:'absolute', width: '250px', top:'258px', left:'905px'}}>X</span>
                    <span style={{position:'absolute', width: '250px', top:'302px', left:'270px'}}>Arsenio Esteban Meza Olofsson</span>
                    <span style={{position:'absolute', width: '250px', top:'302px', left:'895px'}}>3.638.216-7</span>

                    <span style={{position:'absolute', width: '50px', top:'410px', left:'85px', textAlign:'right'}}>20</span>
                    <span style={{position:'absolute', width: '420px', top:'410px', left:'160px'}}>Muslo de pollo</span>
                    <span style={{position:'absolute', width: '420px', top:'410px', left:'560px'}}>25.000</span>
                    <span style={{position:'absolute', width: '420px', top:'410px', left:'560px'}}>25.000</span>
                    
                </div>
                <img src={FacturaTemplate} style={{position:'absolute', opacity:'0.2', width:'1200px', height: '1600px', top:'-5px'}}/>
            </div>
        )
    }
}
