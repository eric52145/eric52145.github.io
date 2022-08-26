import React from "react";

export default function Navbar(){
    return(
        <nav className="navbar">
            <div className="nav--logo">
                <img src="./image/TrollFace.png" className="nav--img"/>
                <h5 className="nav--title">Meme Generator</h5>
            </div>
            <p className="nav--project">React Course - Project 3</p>
            
        </nav>
    )
}