import React, {Component} from 'react';


export default class FacturaImpresion extends Component{

    handlePrint = () =>{
        document.querySelector("#btnImprimir");
        window.print();
    }

    imprimirDatos = () => {
        console.log("#######Impresion de Datos");
    }

    render(){  
        return(
            <div className="a4_sheet">
                <div className="positioned_element c1_contado_x">
                    X
                </div>
                <div className="positioned_element c1_fecha_emision">
                    02/09/2024
                </div>
                <div className="positioned_element c1_ruc">
                    2.569.544
                </div>
                <div className="positioned_element c1_razon_social">
                    Adrian Marcelo Rodriguez Gonzalez
                </div>
                <div className="positioned_element c1_subtotales_5">
                    999.999
                </div>
                <div className="positioned_element c1_subtotales_10">
                    999.999
                </div>
                <div className="positioned_element c1_total_pagar">
                    999.999
                </div>
                <div className="positioned_element c1_iva_5">
                    999.999
                </div>
                <div className="positioned_element c1_iva_10">
                    999.999
                </div>
                <div className="positioned_element c1_iva_total">
                    999.999
                </div>

                <div className="positioned_element c2_contado_x">
                    X
                </div>
                <div className="positioned_element c2_fecha_emision">
                    02/09/2024
                </div>
                <div className="positioned_element c2_ruc">
                    2.569.544
                </div>
                <div className="positioned_element c2_razon_social">
                    Adrian Marcelo Rodriguez Gonzalez
                </div>
                <div className="positioned_element c2_subtotales_5">
                    999.999
                </div>
                <div className="positioned_element c2_subtotales_10">
                    999.999
                </div>
                <div className="positioned_element c2_total_pagar">
                    999.999
                </div>
                <div className="positioned_element c2_iva_5">
                    999.999
                </div>
                <div className="positioned_element c2_iva_10">
                    999.999
                </div>
                <div className="positioned_element c2_iva_total">
                    999.999
                </div>
                

                <table className="positioned_element c1_contenido">
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>5.500</td>
                        <td>120.500</td>
                        <td>1.500</td>
                        <td>120.500</td>
                    </tr>
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>11.500</td>
                        <td>1.500</td>
                        <td>120.500</td>
                        <td>120.500</td>
                    </tr>
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>11.500</td>
                        <td>120.500</td>
                        <td>120.500</td>
                        <td>1.500</td>
                    </tr>
                </table>
                <table className="positioned_element c2_contenido">
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>5.500</td>
                        <td>120.500</td>
                        <td>1.500</td>
                        <td>120.500</td>
                    </tr>
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>11.500</td>
                        <td>1.500</td>
                        <td>120.500</td>
                        <td>120.500</td>
                    </tr>
                    <tr>
                        <td>92,31</td>
                        <td>Puchero x KG</td>
                        <td>11.500</td>
                        <td>120.500</td>
                        <td>120.500</td>
                        <td>1.500</td>
                    </tr>
                </table> 
                
            </div>
        )
    }
}