import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../charts/Chart.css';

const options = {
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'bar',
    height: 335,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: '25%',
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 0,
      columnWidth: '25%',
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: '14px',
    markers: {
      radius: 99,
    },
  },
  fill: {
    opacity: 1,
  },
};

const ChartTwo = ({ thisWeekData, lastWeekData }) => {
  const [selectedOption, setSelectedOption] = useState("thisWeek");
  const [series, setSeries] = useState([
    {
      name: 'Generated',
      data: [],
    },
    {
      name: 'Scanned',
      data: [],
    },
  ]);
  const [categories, setCategories] = useState([]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    let updatedSeries;
    let newCategories;

    if (selectedOption === "thisWeek" && thisWeekData) {
      updatedSeries = series.map((serie) => {
        if (serie.name === 'Generated') {
          return { ...serie, data: thisWeekData.map(item => item.today_tokens_count) };
        }
        if (serie.name === 'Scanned') {
          return { ...serie, data: thisWeekData.map(item => item.today_scanned_tokens) };
        }
        return serie;
      });

      newCategories = thisWeekData.map(item => {
        const date = new Date(item.report_date);
        return dayNames[date.getDay()];
      });
    } else if (selectedOption === "lastWeek" && lastWeekData) {
      updatedSeries = series.map((serie) => {
        if (serie.name === 'Generated') {
          return { ...serie, data: lastWeekData.map(item => item.today_tokens_count) };
        }
        if (serie.name === 'Scanned') {
          return { ...serie, data: lastWeekData.map(item => item.today_scanned_tokens) };
        }
        return serie;
      });

      newCategories = lastWeekData.map(item => {
        const date = new Date(item.report_date);
        return dayNames[date.getDay()];
      });
    }

    setSeries(updatedSeries);
    setCategories(newCategories);
  }, [thisWeekData, lastWeekData, selectedOption]);

  const handleChanges = (event) => {
    setSelectedOption(event.target.value);
  };

  const chartOptions = {
    ...options,
    xaxis: {
      ...options.xaxis,
      categories: categories,
    },
  };

  return (
    <div className="Chart_main_2">
      <div className="chart_profit_main">
        <div>
          <h4 className="chart_profit">Profit this week</h4>
        </div>
        <div>
          <div className="chart_det">
            <select
              name="timeframe"
              id="timeframe"
              className="Chart_two_detailed"
              onChange={handleChanges}
              value={selectedOption}
            >
              <option value="thisWeek" className="dark:bg-boxdark">This Week</option>
              <option value="lastWeek" className="dark:bg-boxdark">Last Week</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="main_chart">
          <ReactApexChart options={chartOptions} series={series} type="bar" height={250} />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
