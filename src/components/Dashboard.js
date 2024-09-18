import { LineChart, BarChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from 'recharts';
const Dashboard=()=>{
    return(
    <div className="dashboard">
      <Box stat="200" info="Peer Connections" c="#1E90FF" />
      <Box stat="200" info="Daily Files Uploads" c="#8884d8" />
      <Box stat="400" info="Daily Files Downloads" c="#0000CD" />
      <LineGraph/>
      <BarGraph/>
    </div>
    )
}
const Box = ({stat, info, c}) => {
    return (
      <div className="box">
        <h3 className="stat" style={{color:c}} >{stat}</h3>
        <p className="info">{info}</p>
      </div>
    );
};

const LineGraph = () => {
    const data = [
        { month: 'Jan', users: 500 },
        { month: 'Feb', users: 405 },
        { month: 'Mar', users: 400 },
        { month: 'Apr', users: 378 },
        { month: 'May', users: 589 },
        { month: 'June', users: 300 },
        { month: 'July', users: 550 }
      ];
    return (
    <div className = "line_graph_container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Line dataKey="users" stroke="#8884d8" />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    <div className ="description">
        <h4 className='graph_caption'> Application Traffic </h4>
    </div>
    </div>
    );
  };
  const BarGraph = () => {
    const data = [
        { month: 'Jan', transaction: 1000 },
        { month: 'Feb', transaction: 805 },
        { month: 'Mar', transaction: 935 },
        { month: 'Apr', transaction: 678 },
        { month: 'May', transaction: 789 },
        { month: 'June', transaction: 320 },
        { month: 'July', transaction: 750 }
      ];
    return (
    <div className = "bar_graph_container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Bar dataKey="transaction" fill="#87CEEB"/>
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    <div className ="description">
        <h4 className='graph_caption'> Oracoin Transactions </h4>
    </div>
    </div>
    );
  };
export default Dashboard