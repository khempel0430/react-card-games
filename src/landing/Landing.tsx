import { Toolbar } from 'primereact/toolbar';
import '../App.css';
import './Landing.css';

const Landing: React.FC = () => {
  const start = <span className="text-2xl font-bold">KHempel's React Cardgames</span>;

  return (
    <div className="App">
        <Toolbar className="App-header" start={start} />
        <div className="App-content">
           Body
        </div>
    </div>
  );
};

export default Landing;
