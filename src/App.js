import './App.css';
import { useState } from 'react';
import { Menu } from './components/nav/menu';
import { NavbarTopMenu } from './components/nav/navbar-top';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from './UserContext';
import './utils/registerLocaleEsp';

import CajaList from './components/caja/caja-list.component';
import UsuariosList from './components/usuarios/usuarios-list.component';
import InventarioList from './components/inventario/inventario-list.component';
import ComprasList from './components/compras/compras-list.component';
import ProveedoresList from './components/proveedores/proveedor-list.component';
import CajaDetallesList from './components/caja-detalles/caja-detalles-list.component';
import CajaConfigList from './components/caja-config/caja-config-list.component';
import ClienteList from './components/clientes/cliente-list.component';

import Login from './components/login/login';
import logout from './components/login/logout';
import useToken from './components/login/useToken';

const jwt = require('jsonwebtoken');
const key = process.env.REACT_APP_JWTKEY;

function App() {
  const [ currentUser, setCurrentUser ] = useState(null); 
  const { token, setToken } = useToken(); 

  if(!token) {
    console.log('Unauthorized: No token provided');
    return <Login setToken={ setToken } />
  }else{
    //Obteniendo Datos del usuario
    jwt.verify(token, key, async function(err, decoded) {
      if (err) {
        console.log('Unauthorized: Invalid token');  
        logout();
      }else{   
        if(!currentUser){
          setCurrentUser({
            id: decoded.id,
            name: decoded.nombre_completo,
            nickname: decoded.nickname,
            roles: decoded.roles,
            fecha: new Date(),
            caja: {}
          })
        }
      } 
    });
  }

  return (
    <div id="container"> 
        <div className="body-wrapper container-fluid p-0">  
          <UserContext.Provider value = { {currentUser} } >
            {
              (window.location.href.indexOf('CajaDetalles') < 0) ? <Menu/>  : <NavbarTopMenu />           
            }
            <BrowserRouter>
              <Routes>
                <Route path='/Caja' element={<CajaList />} />
                <Route path='/CajaDetalles' element={<CajaDetallesList />} />

                <Route path='/Usuarios' element={<UsuariosList />} />
                <Route path='/Inventario' element={<InventarioList />} /> 
                <Route path='/Compras' element={<ComprasList />} /> 
                <Route path='/Proveedores' element={<ProveedoresList />} />     
                <Route path='/CajasConfig' element={<CajaConfigList />} /> 
                <Route path='/Clientes' element={<ClienteList />} /> 
                    
                
              </Routes>
            </BrowserRouter>
          </UserContext.Provider> 
        </div>
      </div>
  );
}

export default App;
