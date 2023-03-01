import { useContext } from 'react';
import { Navbar, NavBarItemFolder, NavBarItem } from './navbar.component';
import { faGripHorizontal, faWarehouse, faUserGear, faGear, faList, faUsers, faTruck, faBoxesStacked, faBox, faUserSecret, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../../UserContext';
import { NavbarTopMenu } from './navbar-top';

const Menu = (props) =>{
    const currentUser = useContext(UserContext).currentUser;
    return(
        <div>
            <NavbarTopMenu />
            <Navbar>
                <div className="nav-item">
                    <span className="nav-list-item title" style={{display:'block'}}>
                        Facturacion - Inventario
                    </span>
                </div>
                <NavBarItemFolder icon={faList} name="General">
                    <NavBarItem icon={faGripHorizontal} name="Dashboard" path="/Dashboard" />
                    <NavBarItem icon={faBox} name="Caja" path="/Caja" />                    
                </NavBarItemFolder>
                <NavBarItemFolder icon={faGear} name="Configuraciones"> 
                    <NavBarItem icon={faWarehouse} name="Inventario" path="/Inventario" /> 
                    <NavBarItem icon={faUsers} name="Clientes" path="/Clientes" /> 
                    <NavBarItem icon={faTruck} name="Proveedores" path="/Proveedores" /> 
                    <NavBarItem icon={faCartShopping} name="Compras" path="/Compras" /> 
                    <NavBarItem icon={faBoxesStacked} name="Cajas" path="/CajasConfig" /> 
                    <NavBarItem icon={faUserGear} name="Usuarios" path="/Usuarios" /> 
                    <NavBarItem icon={faWarehouse} name="Timbrados" path="/Timbrados" /> 
                </NavBarItemFolder>
            </Navbar>
        </div>
    )
}

export { Menu }
