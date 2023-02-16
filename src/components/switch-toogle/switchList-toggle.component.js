import React from 'react';
import  './css/switch-toggle.css';

const SwitchList = ({nameToggle, idToggle, onToggle}) => {
    return(
        <label className="menu-item switch">
            <input id={idToggle} type="radio" name={nameToggle} onChange={onToggle}/>
            <span className="slider rounded" />
        </label>

    )
}

export default SwitchList;