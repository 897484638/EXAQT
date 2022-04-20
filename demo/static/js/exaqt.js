let explicit_questions = [];
let implicit_questions = [];
let ordinal_questions = [];
let tempans_questions = [];
let activeQuestionsLists = []
let showedQuestions = []
let selectListShow = !1
let text = '';


// echarts
let relg, completeGST, union, temp;


//loading questions
(function () {
    $.get('/static/data/ques_demo_category.json', function (data) {
        explicit_questions = data['Explicit']
        implicit_questions = data['Implicit']
        ordinal_questions = data['Ordinal']
        tempans_questions = data['Temp.Ans']
        //console.log(explicit_questions);
    })
})()


// //categories
// function classify(d) {
//     let list = d,
//         data = [];
//     for (let i = 0; i < list.length; i++) {
//         if (!data[list[i].Type[0]]) {
//             let arr = [];
//             arr.push(list[i]);
//             data[list[i].Type[0]] = arr;
//
//         } else {
//             data[list[i].Type[0]].push(list[i])
//         }
//     }
//     console.log(data);
//     return data
// }

//select question category
function questionSelect(type, index) {
    $(`.question_btn[data-index='${index}']`).addClass('bg-primary text-white').siblings().removeClass('bg-primary text-white');
    if (type === 'Explicit'){
        activeQuestionsLists = explicit_questions;
    }
    if (type === 'Implicit'){
        activeQuestionsLists = implicit_questions;
    }
    if (type === 'Ordinal'){
        activeQuestionsLists = ordinal_questions;
    }
    if (type === 'Temp.Ans'){
        activeQuestionsLists = tempans_questions;
    }


    //activeQuestionsLists = questions[type]
    //console.log(activeQuestionsLists);
    let df = document.createDocumentFragment()
    activeQuestionsLists.forEach((i, index) => {
        let item = document.createElement('div')
        item.className = 'p-2'
        item.setAttribute('data-index', index)
        item.setAttribute('data-id', i.Id)
        item.innerText = i.Question
        item.setAttribute('onclick', 'selectQs(this)')
        df.appendChild(item)
    })
    $('.select_ops').empty()
    $('.select_ops').append(df)
}

function selectQs(ele) {
    searchVal = ''
    selectListShow == !0 && openSelect()
    showedQuestions.push($(ele).attr('data-id'))
    showedQuestions = [...new Set(showedQuestions)]
    let data = activeQuestionsLists.filter(item => {
        if (item.Id == $(ele).attr('data-id')) {
            return item
        }
    })
    //console.log(data);
    appendQCard(...data)
    $("#input").val(data[0]['Question truecase'])
}

function randomQuestion() {
    text = ''
    $('#input').val('')
    let index = randomIndex(activeQuestionsLists)
    let id = activeQuestionsLists[index].Id
    if (showedQuestions.indexOf(id) !== -1) {
        randomQuestion()
    } else {
        // console.log('data：');
        //console.log(activeQuestionsLists[index]);
        appendQCard(activeQuestionsLists[index])
        $("#input").val(activeQuestionsLists[index]['Question truecase'])
        let df = document.createDocumentFragment()
        activeQuestionsLists.forEach((i, index) => {
            let item = document.createElement('div')
            item.className = 'p-2'
            item.setAttribute('data-index', index)
            item.setAttribute('data-id', i.Id)
            item.innerText = i.Question
            item.setAttribute('onclick', 'selectQs(this)')
            df.appendChild(item)
        })
        $('.select_ops').empty()
        $('.select_ops').append(df)
        showedQuestions.push(id)
    }
}

function show_answer(getanswer){
    let answer = '', seed = '', top5 = '', index1 = '', alltype = '', allsignal = '';
    let answerList = []
    let type = getanswer['Type']
    let signal = getanswer['Temporal signal']
    let seeds = getanswer['Seed entity']
    let top5answer = getanswer['Top5 answer']
    let ground = getanswer['Answer']
    ground.forEach((item, index) =>  {
        if (item.AnswerType == 'Value') {
            answerList.push(item.AnswerArgument)
            }
        else {
            answerList.push(item.WikidataQid)
            }
        answer += `<div class="answer_item">
                         ${index + 1}.&nbsp<a style="display:${item.AnswerType == 'Value' ? 'none' : 'block'}" target="_blank" href="${item.WikipediaURL}"> ${item.WikidataLabel}</a>
                         <span style="display:${item.AnswerType == 'Value' ? 'block' : 'none'}">${index + 1}. ${item.AnswerArgument}</span>
                         </div>`
        })
    seeds.forEach((item, index) =>  {
        let method = ''
        if (item.method == 'ELQ'){
            //method_url = 'https://github.com/facebookresearch/BLINK/tree/main/elq'
            method = `<a href="https://github.com/facebookresearch/BLINK/tree/main/elq" target="_blank">${item.method}</a>`
        }
        if (item.method == 'TAGME'){
            //method_url = 'https://tagme.d4science.org/tagme/'
            method = `<a href="https://tagme.d4science.org/tagme/" target="_blank">${item.method}</a>`
        }
        if (item.method == 'ELQ and TAGME'){
            //method_url = 'https://tagme.d4science.org/tagme/'
            method = `<a href="https://github.com/facebookresearch/BLINK/tree/main/elq" target="_blank">ELQ</a> and <a href="https://tagme.d4science.org/tagme/" target="_blank">TAGME</a>`
        }

        seed += `
                 <div class="answer_item" style="width: 100%">
                     <span> <a href="${item.url}" target="_blank">${item.label}</a> (${item.text}) [Detected by ${method}]</span>
                 </div>
                 `
        })
    top5answer.forEach((item, index) => {
        //<a href="${item.url}" style="color: ${answerList.indexOf(item.label) !== -1 && 'green'}" target="_blank">${item.label}</a></div></div></div>
        console.log(item.rank);
        if (answerList.indexOf(item.qid) !== -1){
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}. <a href="${item.url}" target="_blank">${item.label}</a> [Gold answer]</div></div></div>
	 			`

        }
        else if (answerList.indexOf(item.label + 'T00:00:00Z')  !== -1){
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}. <a href="${item.url}" target="_blank">${item.label}</a> [Gold answer]</div></div></div>
	 			`
        }
        else if (answerList.indexOf(item.label)  !== -1){
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}. <a href="${item.url}" target="_blank">${item.label}</a> [Gold answer]</div></div></div>
	 			`
        }
        else {
        top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}. <a href="${item.url}" target="_blank">${item.label}</a> </div></div></div>
	 			`}
        })

    type.forEach((item, index) => {
        alltype += item + '; '
    })

    signal.forEach((item, index) => {
        allsignal += item + '; '
    })

    alltype = alltype.substring(0,alltype.length-2)
    allsignal = allsignal.substring(0,allsignal.length-2)

    index1 = `
             <div class="col-12 py-2">
                  <span><i class="bi-alarm"></i>&nbsp Category:  ${alltype}</span>
                  <br>
                  <span><i class="bi-alarm"></i>&nbsp Signal:  ${allsignal}</span>
             </div>
             `

    $('#answerText').empty()
    $('#top5').empty()
    $('#seed').empty()
    $('#answerText').append(index1)
    $('#top5').append(top5)
    $('#seed').append(seed)
}


function appendQCard(data) {
    $('#qCard').show()
    $('#qCard h5 span').html(`"${data['Question truecase']}"`)
    console.log(data.Id)
    // get seed, signal, and answers for the question_old from backend
    // $.ajax({
    // type: 'POST',
    // url: "/getanswer",
    // data: {
    //     "id": data.Id
    // },
    // dataType: 'json',
    // success: function(getanswer) {
    //     show_answer(getanswer);
    // }
    // });

    init({
        qkgfactUrl: `${data.Id}_qkg_best25.gexf`,
        relgUrl: `${data.Id}_relg_best25_25.gexf`,
        completeGSTUrl: `${data.Id}_completeGST_best25_25.gexf`,
        unionGSTUrl: `${data.Id}_unionGST_best25_25.gexf`,
        tempUrl: `${data.Id}_temp_best25_25.gexf`,
        ansUrl: `${data.Id}_ans.json`,
    })
}

function answer() {
    if (text.length > 0) {
        let datas = activeQuestionsLists.filter(item => {
            if (item.Question.toLowerCase().indexOf(text) != -1) {
                return item
            }
        })
        let df = document.createDocumentFragment()
        datas.forEach((i, index) => {
            let item = document.createElement('div')
            item.className = 'p-2'
            item.setAttribute('data-index', index)
            item.setAttribute('data-id', i.Id)
            item.innerText = i.Question
            item.setAttribute('onclick', 'selectQs(this)')
            df.appendChild(item)
        })
        $('.select_ops').empty()
        $('.select_ops').append(df)
        selectListShow == !1 && openSelect()
    }

}

function openSelect() {
    if (!selectListShow) {
        $('.select_ops').show(300)
        selectListShow = !0
    } else {
        $('.select_ops').hide(300)
        selectListShow = !1
    }
}

//random
function randomIndex(arr) {
    return Math.floor(Math.random() * (arr.length - 1)) + 1;
}

$(function () {
    //capture input
    $("#input").bind('input propertychange', function () {
        selectListShow == !0 && openSelect()
        text = $(this).val()
    })
})

function init(url) {
    //if exist, then destroy first
    if (relg !== undefined) {
        relg = echarts.init(document.getElementById('relg')).dispose()
    }
    if (completeGST !== undefined) {
        completeGST = echarts.init(document.getElementById('completeGST')).dispose()
    }
    if (union !== undefined) {
        union = echarts.init(document.getElementById('union')).dispose()
    }
    if (temp !== undefined) {
        temp = echarts.init(document.getElementById('temp')).dispose()
    }
    if (qkgfact !== undefined) {
        qkgfact = echarts.init(document.getElementById('qkgfact')).dispose()
    }

    const {relgUrl, completeGSTUrl, unionGSTUrl, tempUrl, qkgfactUrl, ansUrl} = url
    $.get('static/data/question/' + ansUrl, function (data) {
        show_answer(data);
    });

    qkgfact = echarts.init(document.getElementById('qkgfact'))
    qkgfact.showLoading();
    $.get('static/graph/demo_visual_qkg/' + qkgfactUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        // console.info(graph)
        let categories = [];
        let types = [];
        qkgfact.hideLoading();
        categories[0] =
            {
                name: 'Entities',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#ffe699',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Entities' //category name
            };
        categories[1] =
            {
                name: 'NERD entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffe699',
                    borderType: 'solid',
                    borderColor: '#2F528F',
                    borderWidth: 3,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity' //category name
            };
        categories[2] = {
            name: 'Gold answer',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#7fe874',
                color: '#ffe699',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Ground truth' //category name
        };
        categories[3] = {
            name: 'Connectivity entity',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
                borderType: 'solid',
                borderColor: '#FF0000',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Connectivity entity' //category name
        };
        categories[4] = {
            name: 'Predicates',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#ffe699',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Predicates' //category name
        };
        categories[5] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffe699',
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };

        categories[6] = {
            name: 'Connectivity predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
                borderType: 'solid',
                borderColor: '#FF0000',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Connectivity predicate' //category name
        };
        let nodes = []
        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map().set(0, { name: 'Entities',
                    icon: 'circle',
                    })
                    .set(1, {name: 'NERD entity',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#2F528F',
                    })
        .set(2, {name: 'Gold answer',
                    icon: "circle",
                    })
        .set(3, {name: 'Connectivity entity',
                    icon: "circle",
                    })
        .set(4,{name: 'Predicates',
                     icon: 'triangle',
                     })
        .set(5, {name: 'Terminal predicate',
                 icon: "triangle",
                 })
        .set(6, {name: 'Connectivity predicate',
                 icon: "triangle",})

        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.method === "Question relevant facts"){
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                node.category = 2;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === false) {
                node.category = 4;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
                node.category = 5;
            }
            }
            else if (node.attributes.method === "Injecting connectivity"){
                if (node.attributes.type === "subject/object") {
                    node.category = 3;
                }
                else if (node.attributes.type === "predicate") {
                    node.category = 6;
                }

            }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                console.info(v);
                legend_data.push(v)
            }
        }
        console.info(categories_dic);
        console.info(legend_data);

        let links = []
        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
                lineStyle: {
                    normal: {
                    opacity: 0.5,
                    width: 5,
                    color: '#271b12',
                    curveness: 0
                    }
                }
            })
        })
        // console.info(links)
        option = {
            title: {
                // text: 'Question relevant facts',
                // subtext: 'Default layout',
                // top: 'bottom',
                // left: 'right'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (x) {
                    console.info(x.data)
                    console.info(x.data.attributes)
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    } else {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }
            },
            legend: {
                //backgroundColor: '#ccc',
            data: legend_data,
                selectedMode: 'multiple',
                selected:{
                    'Entities': true,
                 'NERD entity':true,
                 'Predicates':true,
                 'Terminal predicate': true,
                 'Gold answer': true,
                 'Connectivity predicate': true,
                 'Connectivity entity': true,
                },
            orient: 'vertical',
            left: 'left'
          },
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    name: 'Question relevant facts',
                    animation: false,
                    type: 'graph',
                    layout: 'force',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    edgeSymbol: ['', ''],
                    edgeSymbolSize: [4, 7],
                    draggable: true,
                    focusNodeAdjacency: true,
                    force: {
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 11,
                            },
                            formatter: function (x) {
                                return x.data.name
                            }
                        }
                    },

                    lineStyle: {
                        normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        }
                    }
                }

            ]
        };
        //window.addEventListener('resize',function(){
        qkgfact.setOption(option);
        window.onresize = function(){
        qkgfact.resize(); // the object initialized by myechart for echarts.init
        }
        window.addEventListener('resize',function(){
        qkgfact.resize()});


    }, 'xml');

    union = echarts.init(document.getElementById('union'))
    union.showLoading();
    $.get('static/graph/demo_visual_gst_nohang/' + unionGSTUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        // console.info(graph)
        let categories = [];
        let types = [];
        union.hideLoading();
        categories[0] =
            {
                name: 'Entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#ffc000',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Entity' //category name
            };
        categories[1] =
            {
                name: 'NERD entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    borderColor: '#2F528F',
                    borderWidth: 3,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity' //category name
            };
        categories[2] = {
            name: 'Gold answer',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#7fe874',
                color: '#ffc000',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Gold answer' //category name
        };
        categories[3] = {
            name: 'Predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#ffc000',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Predicate' //category name
        };
        categories[4] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map().set(0, { name: 'Entity',
                    icon: 'circle',
                    })
                    .set(1, {name: 'NERD entity',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#2F528F',
                    })
        .set(2, {name: 'Gold answer',
                    icon: "circle",
                    })
        .set(3,{name: 'Predicate',
                     icon: 'triangle',
                     })
        .set(4, {name: 'Terminal predicate',
                 icon: "triangle",
                 })

        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                node.category = 2;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === false) {
                node.category = 3;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
                node.category = 4;
            }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                console.info(v);
                legend_data.push(v)
            }
        }
        let links = []
        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
                lineStyle: {
                    normal: {
                        opacity: 0.5,
                        width: 5,
                        color: '#271b12',
                        curveness: 0
                    }
                }
            })
        })
        // console.info(links)
        option = {
            title: {
                // text: 'Union of GSTs',
                // subtext: 'Default layout',
                // top: 'bottom',
                // left: 'right'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (x) {
                    console.info(x.data)
                    console.info(x.data.attributes)
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    } else {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }
            },
            legend: {
            data: legend_data,
                selected:{
                'Entity': true,
                 'NERD entity':true,
                 'Predicate':true,
                 'Terminal predicate': true,
                 'Gold answer': true,
                },
            orient: 'vertical',
            left: 'left'
          },
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    name: 'Union of GSTs graph',
                    animation: false,
                    type: 'graph',
                    layout: 'force',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    edgeSymbol: ['', ''],
                    edgeSymbolSize: [4, 7],
                    draggable: true,
                    focusNodeAdjacency: true,
                    force: {
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 11,
                            },
                            formatter: function (x) {
                                return x.data.name
                            }
                        }
                    },

                    lineStyle: {
                        normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        }
                    }
                }
            ]
        };
        //window.addEventListener('resize',function(){
        union.setOption(option);
        window.onresize = function(){
        union.resize(); // the object initialized by myechart for echarts.init
        }
        window.addEventListener('resize',function(){
        union.resize()});


    }, 'xml');
    // union.on('mouseup', function (params) {
    //     let option = union.getOption();
    //     option.series[0].data[params.dataIndex].x = params.event.offsetX;
    //     option.series[0].data[params.dataIndex].y = params.event.offsetY;
    //     option.series[0].data[params.dataIndex].fixed = true;
    //     union.setOption(option);
    // });

    completeGST = echarts.init(document.getElementById('completeGST'))
    completeGST.showLoading();
    $.get('static/graph/demo_visual_comgst_nohang/' + completeGSTUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        // console.info(graph)
        let categories = [];
        let types = [];
        completeGST.hideLoading();
        categories[0] =
            {
                name: 'GST entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#ffc000',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'GST entity' //category name
            };
        categories[1] =
            {
                name: 'NERD entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    borderColor: '#2F528F',
                    borderWidth: 3,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity' //category name
            };
        categories[2] = {
            name: 'Gold answer in GSTs',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#7fe874',
                color: '#ffc000',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Gold answer in GSTs' //category name
        };
        categories[3] = {
            name: 'Completed entity',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Completed entity' //category name
        };
        categories[4] = {
            name: 'Gold answer in completed GSTs',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Completed predicate' //category name
        };
        categories[5] = {
            name: 'GST predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#ffc000',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'GST predicate' //category name
        };
        categories[6] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };

        categories[7] = {
            name: 'Completed predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Completed predicate' //category name
        };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map().set(0, { name: 'GST entity',
                    icon: 'circle',
                    })
                    .set(1, {name: 'NERD entity',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#2F528F',
                    })
        .set(2, {name: 'Gold answer in GSTs',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#65B95C',
                    })
        .set(3, {name: 'Completed entity',
                    icon: "circle",
                    })
            .set(4, {name: 'Gold answer in completed GSTs',
                 icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#65B95C',})
        .set(5,{name: 'GST predicate',
                     icon: 'triangle',
                     })
        .set(6, {name: 'Terminal predicate',
                 icon: "triangle",
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
                 })
        .set(7, {name: 'Completed predicate',
                 icon: "triangle",})

        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.method === "GSTs"){
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                node.category = 2;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === false) {
                node.category = 5;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
                node.category = 6;
            }
            }
            else if (node.attributes.method === "CompletedGSTs") {
                if (node.attributes.type === "subject/object" && node.attributes.ground === false) {
                    node.category = 3;
                }
                else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                    node.category = 4;
                }
                else if (node.attributes.type === "predicate") {
                    node.category = 7;
                }

            }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                console.info(v);
                legend_data.push(v)
            }
        };
        let links = []
        // graph.links.forEach((item, index) => {
        //     const source = nodes.indexOf(item.source)
        //     const target = nodes.indexOf(item.target)
        //     links.push({
        //         name: item.name,
        //         source: source,
        //         target: target,
        //     })
        // })

        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
                lineStyle: {
                    normal: {
                        opacity: 0.5,
                        width: 5,
                        color: '#271b12',
                        curveness: 0
                    }
                }
            })
        })

        // console.info(links)
        option = {
            title: {
                // //text: 'Completed GSTs',
                // subtext: 'Default layout',
                // top: 'bottom',
                // left: 'right'
            },
            tooltip: {
                trigger: 'item', 
                formatter: function (x) {
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    } else {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }
            },
            legend: {

            data: legend_data,
                 selected:{
                'GST entity': true,
                 'NERD entity':true,
                 'GST predicate':true,
                 'Terminal predicate': true,
                 'Gold answer in GSTs': true,
                 'Completed entity': true,
                 'Completed predicate': true,
                 'Gold answer in completed GSTs': true,
                },
            orient: 'vertical',
            left: 'left'
          },

            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    name: 'Completed GSTs graph',
                    animation: false,
                    type: 'graph',
                    layout: 'force',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    edgeSymbol: ['', ''],
                    edgeSymbolSize: [4, 7],
                    draggable: true,
                    focusNodeAdjacency: true,
                    force: {
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 11,
                            },
                            formatter: function (x) {
                                return x.data.name
                            }
                        }
                    },

                    lineStyle: {
                        normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        }
                    }
                }
            ]
        };
        //window.addEventListener('resize',function(){
        //union.resize()});
        completeGST.setOption(option);
        window.onresize = function(){
        completeGST.resize(); // the object initialized by myechart for echarts.init
        }
        window.addEventListener('resize',function(){
        completeGST.resize()});

    }, 'xml');
    // completeGST.on('mouseup', function (params) {
    //     let option = completeGST.getOption();
    //     option.series[0].data[params.dataIndex].x = params.event.offsetX;
    //     option.series[0].data[params.dataIndex].y = params.event.offsetY;
    //     option.series[0].data[params.dataIndex].fixed = true;
    //     completeGST.setOption(option);
    // });


    temp = echarts.init(document.getElementById('temp'))
    temp.showLoading();
    $.get('static/graph/demo_visual_temenhance/' + tempUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        let categories = [];
        temp.hideLoading();
        categories[0] =
            {
                name: 'GST entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#ffc000',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'GST entity' //category name
            };
        categories[1] =
            {
                name: 'NERD entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    borderColor: '#2F528F',
                    borderWidth: 3,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity' //category name
            };
        categories[2] = {
            name: 'Gold answer in GSTs',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#7fe874',
                color: '#ffc000',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Gold answer in GSTs' //category name
        };
        categories[3] = {
            name: 'Completed entity',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Completed entity' //category name
        };
        categories[4] = {
            name: 'Gold answer in completed GSTs',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Completed predicate' //category name
        };
        categories[5] = {
            name: 'Temporal-fact enhanced entity',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#99dff9',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Temporal-fact enhanced entity' //category name
        };
        categories[6] = {
            name: 'Gold answer in temporal facts',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#99dff9',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 3,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Gold answer in temporal facts' //category name
        };
        categories[7] = {
            name: 'GST predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#ffc000',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'GST predicate' //category name
        };
        categories[8] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };

        categories[9] = {
            name: 'Completed predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Completed predicate' //category name
        };

        categories[10] = {
            name: 'Temporal-fact enhanced predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#99dff9',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Temporal-fact enhanced predicate' //category name
        };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map().set(0, { name: 'GST entity',
                    icon: 'circle',
                    })
                    .set(1, {name: 'NERD entity',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#2F528F',
                    })
        .set(2, {name: 'Gold answer in GSTs',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#65B95C',
                    })
        .set(3, {name: 'Completed entity',
                    icon: "circle",
                    })
            .set(4, {name: 'Gold answer in completed GSTs',
                 icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#65B95C',})
            .set(5, { name: 'Temporal-fact enhanced entity',
                    icon: 'circle',
                    })
            .set(6, { name: 'Gold answer in temporal facts',
                    icon: 'circle',
                    borderType: 'solid',
                    borderWidth: 3,
                    borderColor: '#65B95C',
                    })
            .set(7,{name: 'GST predicate',
                     icon: 'triangle',
                     })
            .set(8, {name: 'Terminal predicate',
                 icon: "triangle",
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
                 })
        .set(9, {name: 'Completed predicate',
                 icon: "triangle",})
        .set(10, {name: 'Temporal-fact enhanced predicate',
                 icon: "triangle",})

        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.method === "GSTs"){
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                node.category = 2;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === false) {
                node.category = 7;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
                node.category = 8;
            }
            }
            else if (node.attributes.method === "CompleteGSTs") {
                if (node.attributes.type === "subject/object" && node.attributes.ground === false) {
                    node.category = 3;
                }
                else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                    node.category = 4;
                }
                else if (node.attributes.type === "predicate") {
                    node.category = 9;
                }

            }
            else if (node.attributes.method === "TemporalEnhance"){
                 if (node.attributes.type === "subject/object" && node.attributes.ground === false) {
                    node.category = 5;
                }
                else if (node.attributes.type === "subject/object" && node.attributes.ground === true) {
                    node.category = 6;
                }
                else if (node.attributes.type === "predicate") {
                    node.category = 10;
                }
            }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                console.info(v);
                legend_data.push(v)
            }
        };
        let links = []
        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
            })
        })
        // console.info(links)
        option = {
            title: {
                // text: 'Temporal-fact enhanced completed GSTs',
                // subtext: 'Default layout',
                // top: 'bottom',
                // left: 'right'
            },
            tooltip: {
                trigger: 'item', 
                formatter: function (x) {
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    }
                    else {
                       return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }},
            legend: {
            data: legend_data,
                selected:{
                    'GST entity': true,
                 'NERD entity':true,
                 'Gold answer in GSTs': true,
                 'Completed entity': true,
                 'Gold answer in completed GSTs': true,
                 'Temporal-fact enhanced entity': true,
                 'Gold answer in temporal facts': true,
                 'GST predicate':true,
                 'Terminal predicate': true,
                 'Completed predicate': true,
                 'Temporal-fact enhanced predicate': true,
                },

            orient: 'vertical',
            left: 'left'
          },
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    name: 'Temporal enhanced graph',
                    animation: false,
                    type: 'graph',
                    layout: 'force',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    edgeSymbol: ['', ''],
                    edgeSymbolSize: [4, 7],
                    draggable: true,
                    focusNodeAdjacency: true,
                    force: {
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {},

                    lineStyle: {
                        normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        }
                    }
                }
            ]
        };


        temp.setOption(option);
        window.onresize = function(){
        temp.resize(); // the object initialized by myechart for echarts.init
        }
        window.addEventListener('resize',function(){
        temp.resize()});


    }, 'xml');

    // temp.on('mouseup', function (params) {
    //     let option = temp.getOption();
    //     option.series[0].data[params.dataIndex].x = params.event.offsetX;
    //     option.series[0].data[params.dataIndex].y = params.event.offsetY;
    //     option.series[0].data[params.dataIndex].fixed = true;
    //     temp.setOption(option);
    // });
        relg = echarts.init(document.getElementById('relg'))
    relg.showLoading()
    //$.get('static/graph/demo_visual_relg_v6/' + relgUrl, function (xml) {
    $.get('static/graph/demo_visual_relg/' + relgUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        // console.info(graph)
        let categories = [];
        relg.hideLoading();
        categories[0] =
            {
                name: 'NERD entity',
                symbol: "circle",
                //symbolSize: 30,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#d37c23',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'GST entity' //category name
            };
        categories[1] =
            {
                name: 'GST entity',
                symbol: "circle",
                //symbolSize: 30,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#ffc000',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'GST entity' //category name
            };

        categories[2] = {
            name: 'Completed entity',
            symbol: 'circle',
            //symbolSize: 30,
            itemStyle: {
                //color: '#4682b4',
                color: '#ffe699',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Completed entity' //category name
        };

        categories[3] = {
            name: 'Temporal-fact enhanced entity',
            symbol: 'circle',
            //symbolSize: 30,
            itemStyle: {
                //color: '#4682b4',
                color: '#99dff9',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Temporal-fact enhanced entity' //category name
        };

        categories[4] = {
            name: 'Gold answer',
            symbol: 'circle',
            //symbolSize: 30,
            itemStyle: {
                //color: '#4682b4',
                color: '#65B95C',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Gold answer' //category name
        };
        categories[5] = {
            name: 'St-ID',
            symbol: 'circle',
            //symbolSize: 70,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#807E7AFF',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'St-ID' //category name
        };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map().set(0, { name: 'NERD entity',
                    icon: 'circle',
                    })
                    .set(1, {name: 'GST entity',
                    icon: "circle",
                    })
                    .set(2, {name: 'Completed entity',
                    icon: "circle",
                    })
        .set(3, {name: 'Temporal-fact enhanced entity',
                    icon: "circle",
                    })
        .set(4, {name: 'Gold answer',
                    icon: "circle",
                    })
            .set(5, {
                name: 'St-ID',
                icon: "circle",
            })

        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.seed === true){
                node.category = 0;
            }
            else if (node.attributes.method === "GSTs" && node.attributes.ground === true) {
                node.category = 4;
            }
            else if (node.attributes.method === "GSTs" && node.attributes.ground === false){
            node.category = 1;
            }
            else if (node.attributes.method === "CompleteGSTs"  && node.attributes.ground === true) {
                node.category = 4;
            }
            else if (node.attributes.method === "CompleteGSTs" && node.attributes.ground === false) {
                node.category = 2;
            }
            else if (node.attributes.method === "TemporalEnhance" && node.attributes.ground === true) {
                node.category = 4;
            }
            else if (node.attributes.method === "TemporalEnhance" && node.attributes.ground === false) {
                node.category = 3;
            }
            else if (node.attributes.method === "cvt") {
                node.category = 5;
            }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                console.info(v);
                legend_data.push(v)
            }
        };
        let links = []
        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
                lineStyle: {
                    normal: {
                        opacity: 0.5,
                        width: 5,
                        color: '#271b12',
                        curveness: 0
                    }
                }
            })
        })
        //console.info(links)
        option = {
            title: {
                text: 'Relational graph',
                subtext: 'Default layout',
                top: 'bottom',
                left: 'right'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (x) {
                    //console.log(x.data.attributes);
                    if (x.data.attributes.method === 'cvt'){
                        return '<div style=" "> intermediate node'
                    }
                    if (x.data.attributes.top === false){
                        return '<div style=" "> Label: ' + x.data.name + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Top5 answer: ' + x.data.attributes.top + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                    else{
                        return '<div style=" "> Label: ' + x.data.name + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Top5 answer: ' + x.data.attributes.top + "<br>" + '<div style=" "> Rank: ' + x.data.attributes.rank + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }
            },
            legend: {
                data: legend_data,
                selected:{
                    'NERD entity':true,
                    'GST entity':true,
                    'Completed entity':true,
                    'Temporal-fact enhance entity':true,
                    'Gold answer':true,
                    'St-ID':true,
                },
            orient: 'vertical',
            left: 'left'
          },
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [
                {
                    name: 'Relational graph',
                    animation: false,
                    type: 'graph',
                    layout: 'force',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    edgeSymbol: ['', 'arrow'],
                    edgeSymbolSize: [4, 7],
                    draggable: true,
                    focusNodeAdjacency: true,
                    force: {
                        //initLayout: 'circular',
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 13,
                                color: '#000000',
                            },
                            formatter: function (x) {
                                return x.data.name
                            }
                        }
                    },
                    lineStyle: {
                    normal: {
                        opacity: 0.5,
                        width: 2.5,
                        color: '#271b12',
                        curveness: 0,
                    //     width: {formatter: function (x) {
                    //             return x.data.weight *10 }
                    // }
                }}
                    //lineStyle: {
                        //normal: {
                            //opacity: 0.5,
                            //width: 1,
                            //color: '#271b12',
                            //curveness: 0
                       // }
                   // }
                }
            ]
        };

        relg.setOption(option);
        window.onresize = function(){
        relg.resize(); // the object initialized by myechart for echarts.init
        }
        window.addEventListener('resize',function(){
        relg.resize()});
    }, 'xml');
    // relg.on('mouseup', function (params) {
    //     let option = relg.getOption();
    //     option.series[0].data[params.dataIndex].x = params.event.offsetX;
    //     option.series[0].data[params.dataIndex].y = params.event.offsetY;
    //     option.series[0].data[params.dataIndex].fixed = true;
    //     relg.setOption(option);
    // });
}

