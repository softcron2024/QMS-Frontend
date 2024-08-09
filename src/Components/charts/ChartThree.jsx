import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../charts/Chart.css'

// interface ChartThreeState {
//   series: number[];
// }

//#region Chart for Dashboard three

const options = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'donut',
  },
  colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF'],
  labels: ['Desktop', 'Tablet', 'Mobile', 'Unknown'],
  legend: {
    show: false,
    position: 'bottom',
  },

  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

const ChartThree = () => {
  const [state, setState] = useState({
    series: [65, 34, 12, 56],
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [65, 34, 12, 56],
    }));
  };
  useEffect(() => {
    handleReset()
  }, [])

  //#endregion

  return (
    <div className="container_Chart_three">
      <div className="header">
        <h5 className="title">Visitors Analytics</h5>
        <div className="dropdown-container">
          <select className="dropdown">
            <option value="">Monthly</option>
            <option value="">Yearly</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        <div id="chartThree" className="chart">
          <ReactApexChart options={options} series={state.series} type="donut" />
        </div>
      </div>

      <div className="data-container">
        <div className="data-item">
          <span className="indicator bg-primary"></span>
          <p className="data-text">
            <span>Desktop</span>
            <span>65%</span>
          </p>
        </div>
        <div className="data-item">
          <span className="indicator bg-secondary"></span>
          <p className="data-text">
            <span>Tablet</span>
            <span>34%</span>
          </p>
        </div>
        <div className="data-item">
          <span className="indicator bg-tertiary"></span>
          <p className="data-text">
            <span>Mobile</span>
            <span>45%</span>
          </p>
        </div>
        <div className="data-item">
          <span className="indicator bg-quaternary"></span>
          <p className="data-text">
            <span>Unknown</span>
            <span>12%</span>
          </p>
        </div>
      </div>
    </div>

  );
};

export default ChartThree;
