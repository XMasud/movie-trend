import './App.css'
import {useState} from "react";

const Card = ({title, ratings, isCool}) => {

    const [hasLiked, setHasLiked] = useState(false);

    return (
        <div className="card">
            <h3>{title}</h3>
            <button onClick={() => setHasLiked(true)}>
                Like
            </button>
        </div>
    )
}


const App = () => {

    return (
        <div className="card-container">

            <Card title="Star Wars" ratings={5} isCool={true}/>
            <Card title="Avatar"/>
            <Card title="Vikings"/>

        </div>
    )
}

export default App
