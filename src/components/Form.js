import React from "react";
// import data from "../data";

export default function Form(){
    

function getMemeImage(){ 
        const memeArray = allMemes
        const randomNumber = Math.floor(Math.random() * memeArray.length)
        const url = memeArray[randomNumber].url
        setMeme(prevMeme => ({
           
                ...prevMeme,
                randomimage: url
        }))
        // const url = memeArray[randomNumber].url
    }
    
    const [meme, setMeme]=React.useState({
        topText:"",
        bottomText:"",
        randomimage:"http://i.imgflip.com/1bij.jpg"
    })
    
    const [allMemes, setAllmemes] = React.useState([])
    React.useEffect(()=>{
        fetch("https://api.imgflip.com/get_memes")
            .then(res => res.json())
            .then(data => setAllmemes(data.data.memes))
    },[])

    const [formData, setFormData]=React.useState({upperWord:"",BottomWord:""})
    
    console.log(formData)
    function handleChange(event){
        setFormData(prevFormData => {
            return{
                ...prevFormData,
                [event.target.name]:event.target.value
            }
        })
        // [event.target.name]:[event.target.value]
    }

    return(
        <div>
            <div className="form">
                <input 
                onChange={handleChange} 
                name="upperWord" 
                placeholder="Upper word" 
                value={formData.upperWord} 
                type="text"/>

                <input 
                onChange={handleChange} 
                value={formData.BottomWord} 
                name="BottomWord" 
                placeholder="Bottom word" 
                type="text"/>

                <br></br>
                <button className="button" onClick={getMemeImage}>
                Get a new meme image
                </button>
                <div>
                <div className="meme">
                    <img src={meme.randomimage} className="meme--image"></img>
                    <h1 className="img--upperword">{formData.upperWord}</h1>
                    <h1 className="img--bottomword">{formData.BottomWord}</h1>
                </div>
                    
                </div>
            </div>
        </div>
    )
}