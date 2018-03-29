// Creates Widgets
function renderWidgets(filterObj) {
    var numbers = {};
    const fileCSV = './OCRpixels.csv';

    // ajax request for digits data
    fetch(fileCSV, { mode: 'no-cors' })
        .then(response => response.text())
        .then(text => {
            // create arr of 50K lines
            let arr = text.split("\n");
            for (let i = 0; i < 50000; i++) {
                // creates an object with 10 keys
                // 1 for each digit
                // The value of each key will be an arr of 5000 rows
                // Each row is an image of 16x16 pixels
                if (numbers[arr[i][0]]) {
                    numbers[arr[i][0]].push(arr[i].split(","));
                } else {
                    numbers[arr[i][0]] = [arr[i].split(",")];
                }
            }
            // Res will hold 10 images
            let res = [];
            let controlPanel = {};
            for (let number = 0; number < 10; number++) {
                // iterate for each digit
                // keys into numbers object for 5K of image rows;
                let num = numbers[number];
                let rowLength = num[0].length;
                let image = [];
                let colIdx = 1;
                // check if a filterObj has been provided
                if (filterObj) {
                    num = filterImages(num, filterObj);
                }

                while (colIdx < rowLength) {
                    let sum = 0;
                    let rowIdx = 0;
                    while (rowIdx < num.length) {
                        // builds sum from pixel in the column of the selected images
                        let currPixel = Number(num[rowIdx][colIdx]);
                        sum += currPixel;
                        rowIdx += 1;
                    }
                    // greyScale calculation
                    let greyScale = (255 * (1 - (sum / num.length)));
                    // Builds Object for data to pass along for 
                    // metrics panel
                    controlPanel[number] = {
                        "number": number,
                        "currRowCount": num.length,
                        "TotalRowCount": 5000
                    };
                    image.push(greyScale);
                    colIdx += 1;
                }
                res.push(image);    
            }
            // removes loader
            const loader = document.getElementsByClassName('loader')[0];
            loader.classList.add('disabled');

            // Loop create widget and pixel children
            for (let i = 0; i < res.length; i++) {
                const currImage = res[i];
                let widget = document.createElement('div');
                widget.classList.add("widget");
                for (let j = 0; j < currImage.length; j++) {
                    // set color for pixel
                    let color = Math.floor(currImage[j]);
                    let pixel = document.createElement('div');
                    pixel.classList.add('square');
                    pixel.style.backgroundColor =  'rgb(' + [color,color,color].join(',') + ')';
                    widget.appendChild(pixel);
                }
                // adds widget to widget container
                let container = document.getElementById('widget-container');
                widget.appendChild(createMetricPanel(controlPanel[i]));
                container.appendChild(widget);
            }
        })
        .catch(e => console.log(e));
}

// Filters the number of rows in the digit's 5K of image rows
// that complies with all of the filter options
function filterImages(arr, filterObj) {
    let result = [];

    let indexes = Object.keys(filterObj);
    
    result = arr.filter(row => {
        let validation = 0;
        for (let i = 0; i < indexes.length; i++) {
            const idx = Number(indexes[i]);
            if (Number(row[idx + 1]) === filterObj[idx]) {
                validation += 1;
            }
        }
        // if validation is the same length as indexes
        // then row complies with all rules
        if (validation === indexes.length) {
            return row;
        }
    });
    return result;
}

function createMetricPanel(info) {
    let num = info.number;
    let currRowCount = info.currRowCount;
    let TotalRowCount = info.TotalRowCount;

    let rowContainer = document.createElement('div');
    rowContainer.classList.add('metric-container');

    let numberDiv = document.createElement('div');
    let currRowDiv = document.createElement('div');
    let totalRowDiv = document.createElement('div');

    numberDiv.classList.add('metric-data');
    currRowDiv.classList.add('metric-data');
    totalRowDiv.classList.add('metric-data');

    let numberDivLabel = document.createElement('p');
    let currRowDivLabel = document.createElement('p');
    let totalRowDivLabel = document.createElement('p');

    numberDivLabel.innerHTML = `Number: ${num}`;
    currRowDivLabel.innerHTML = `Rows Displayed: ${currRowCount}`;
    totalRowDivLabel.innerHTML = `Total Rows: ${TotalRowCount}`;
    
    numberDiv.appendChild(numberDivLabel);
    currRowDiv.appendChild(currRowDivLabel);
    totalRowDiv.appendChild(totalRowDivLabel);

    rowContainer.appendChild(numberDiv);
    rowContainer.appendChild(currRowDiv);
    rowContainer.appendChild(totalRowDiv);

    return rowContainer;
}


document.addEventListener('DOMContentLoaded', () => {
            // inital render of widgets
            renderWidgets(null);

            // creates controller widget
            let controlWidget = document.createElement('div');
            controlWidget.classList.add('control-widget');
            for (let i = 0; i < 256; i++) {
                let pixel = document.createElement('div');
                // set index of square as meta data
                // this is later used in the row filter
                // function to identify which pixel is
                // the filter
                pixel.dataset.index = i;

                // add styling to squares/pixels
                pixel.classList.add('square');
                pixel.style.backgroundColor = 'grey';
                pixel.style.borderColor = "black";
                pixel.style.borderWidth = "1px";
                pixel.style.borderStyle = "solid";
                controlWidget.appendChild(pixel);
            }

            let controlWidgetContainer = document.getElementById('control-widget-container');

            controlWidgetContainer.appendChild(controlWidget);
        
            let controller = document.getElementsByClassName('control-widget')[0];

            let filterObj = {};
            // Event listens for clicks in the widget controller
            // then changes the pixel based on rules below
            controller.addEventListener('click', (e) => {
                let square = e.target;
                let idx = square.dataset.index;
                if (square.style.backgroundColor === 'grey') {
                    square.style.backgroundColor = 'black';
                    filterObj[idx] = 1;
                } else if (square.style.backgroundColor === 'black') {
                    square.style.backgroundColor = 'white';
                    filterObj[idx] = 0;
                } else if (square.style.backgroundColor === 'white') {
                    square.style.backgroundColor = 'grey';
                    delete filterObj[idx];
                }
            });

            let btn = document.getElementById("filter-btn");
            // Event listener handles submit of the filter options
            // based on the present state of the controller widget
            // then reset the controller widget
            btn.addEventListener('click', () => {
                const loader = document.getElementsByClassName('loader')[0];
                loader.classList.remove('disabled');
                let container = document.getElementById('widget-container');

                // on Submit destory current widgets and re-renders
                while (container.children[1]) {
                    let child = container.children[1];
                    container.removeChild(child);
                }
            
                renderWidgets(filterObj);
                filterObj = {};
                // reset controller widget on submit
                let children = controller.children;
                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    child.style.backgroundColor = 'grey';
                }
            });
});


