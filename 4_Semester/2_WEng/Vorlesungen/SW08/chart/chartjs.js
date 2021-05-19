var ctx = document.getElementById("chart1");

var chart1 = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["A", "B", "C", "D"],
        datasets: [{
            label: 'dataset 1',
            data: [44, 32, 236, 73],
            backgroundColor: 'rgba(255, 99, 132, 0.2)' ,
            borderColor: 'rgba(255,99,132,1)' ,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

var ctx2 = document.getElementById("chart2");

var chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: ["A", "B", "C", "D"],
        datasets: [{
            label: 'dataset 1',
            data: [44, 32, 236, 73],
            backgroundColor: ['green','blue','red','black'] ,
        }]
    },
    options: {
    }
});


function addData(){

    var labelName = document.getElementById("datalabel").value;
    var value = document.getElementById("datavalue").value;
    var color = document.getElementById("datacolor").value;

    chart1.data.labels.push(labelName)
    chart1.data.datasets[0].data.push(value)
    chart1.update()

    chart2.data.labels.push(labelName)
    chart2.data.datasets[0].data.push(value)
    chart2.data.datasets[0].backgroundColor.push(color)
    chart2.update()
}