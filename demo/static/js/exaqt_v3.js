let total_questions = [];
let explicit_questions = [];
let implicit_questions = [];
let ordinal_questions = [];
let tempans_questions = [];
let ordtem_questions = [];
let expord_questions = [];
let impord_questions = [];
let imptem_questions = [];
let expimp_questions = [];
let exptem_questions = [];
let impordtem_questions = [];
let activeQuestionsLists = [];
let showedQuestions = [];
let selectListShow = !1;
let text = '';
var qkgfactUrl_onlick = '';
var gstUrl_onlick = '';
var comgstUrl_onlick = '';
var temenhUrl_onlick = '';
var anspretUrl_onlick = '';

// echarts
let qkgfact, relg, completeGST, union, temp;

//loading questions
(function () {
    $.get('/static/data/ques_demo_category_multi.json', function (data) {
        explicit_questions = data['Explicit']
        implicit_questions = data['Implicit']
        ordinal_questions = data['Ordinal']
        tempans_questions = data['Temp.Ans']
        ordtem_questions = data['Ordinal;Temp.Ans']
        expord_questions = data['Explicit;Ordinal']
        imptem_questions = data['Implicit;Temp.Ans']
        impord_questions = data['Implicit;Ordinal']
        expimp_questions = data['Explicit;Implicit']
        exptem_questions = data['Explicit;Temp.Ans']
        impordtem_questions = data['Implicit;Ordinal;Temp.Ans']
        total_questions = get_total(explicit_questions,implicit_questions,ordinal_questions,tempans_questions)

    })
})()

function get_total(arr1,arr2,arr3,arr4){
    var new_arry = []
    for (var i = 0; i < arr1.length; i++) {
        var index=new_arry.indexOf(arr1[i])
        if(index==-1){
            new_arry.push(arr1[i])
        }
    }

    for (var i = 0; i < arr2.length; i++) {
        var index=new_arry.indexOf(arr2[i])
        if(index==-1){
            new_arry.push(arr2[i])
        }
    }

    for (var i = 0; i < arr3.length; i++) {
        var index=new_arry.indexOf(arr3[i])
        if(index==-1){
            new_arry.push(arr3[i])
        }
    }

    for (var i = 0; i < arr4.length; i++) {
        var index=new_arry.indexOf(arr4[i])
        if(index==-1){
            new_arry.push(arr4[i])
        }
    }
    return new_arry

}

function replaceDoc()
{
    window.location.replace("https://exaqt.mpi-inf.mpg.de")
}


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

$(document).ready(function(){
      var total=0;
      var select_cat=[];
      const check_categories = new Map().set('chkExplicit', 'Explicit')
                    .set('chkImplicit', 'Implicit')
        .set('chkOrdinal', 'Ordinal')
        .set('chkTmpans', 'Temp.Ans')
      $("form input").on("click",function(){
        var id=$(this).attr("id");
        if($(this).is(":checked")){
          total+=1;
          select_cat.push(check_categories.get(id));
        }else{
          total-=1;
          select_cat.splice(select_cat.indexOf(check_categories.get(id)),1);
        }

        Validate(total, select_cat)

      });

    });

const isArrEqual = (value, select_cat) => {
                        return value.length === select_cat.length && value.every((ele) => select_cat.includes(ele));
                        };

function Validate(checked, select_cat) {
        var bt = document.getElementById('randomButton');
        activeQuestionsLists = []

        const check_categories_map = new Map().set(explicit_questions, ["Explicit"])
                    .set(implicit_questions, ["Implicit"])
        .set(ordinal_questions, ["Ordinal"])
        .set(tempans_questions, ["Temp.Ans"])
        .set(ordtem_questions,["Ordinal","Temp.Ans"])
        .set(expord_questions, ["Explicit","Ordinal"])
        .set(imptem_questions, ["Implicit","Temp.Ans"])
        .set(impord_questions, ["Implicit","Ordinal"])
        .set(expimp_questions, ["Explicit","Implicit"])
        .set(exptem_questions, ["Explicit","Temp.Ans"])
        .set(impordtem_questions, ["Implicit","Ordinal","Temp.Ans"])

        if (checked > 0) {
                check_categories_map.forEach(function(value,key){
                if (isArrEqual(value, select_cat)){
                        activeQuestionsLists = key;

                }
                })}

        if (checked == 0) {
            activeQuestionsLists = shuffle(total_questions).slice(0,500)

        }

        if (activeQuestionsLists.length === 0) {
            //clearinput()
            let df = document.createDocumentFragment()
            let item1 = document.createElement('div')
            item1.className = 'p-1'
            item1.innerText = "No questions to show. The reasons might be:"
            df.appendChild(item1)
            let item2 = document.createElement('div')
            item2.className = 'p-1'
            item2.innerText = "1. No questions belong to the chosen category combination. Please try a different one."
            df.appendChild(item2)
            let item3 = document.createElement('div')
            item3.className = 'p-1'
            item3.innerText = "2. It takes about one minute to load the data. If you are visiting this website for the first time, then please wait for a few more seconds."
            df.appendChild(item3)

            $('.select_ops').empty()
            $('.select_ops').append(df)

              bt.disabled = true;
                    }
        if (activeQuestionsLists.length > 0){
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
                //$("#input").val(df[0].innerText)
                bt.disabled = false;
                }}


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
    //$('#input').val('')
    if (activeQuestionsLists.length === 0) {
        activeQuestionsLists = shuffle(total_questions).slice(0,500)
    }
    let index = randomIndex(activeQuestionsLists)
    let id = activeQuestionsLists[index].Id
    //if (showedQuestions.indexOf(id) !== -1) {
    //    randomQuestion()
    //} else {
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

function show_answer(getanswer){
    let answer = '', seed = '', top5 = '', index1 = '', alltype = '', allsignal = '';
    let answerList = []
    let type = getanswer['Temporal question type']
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
        //console.log(item.rank);
        if (answerList.indexOf(item.qid) !== -1){
            if (item.url === ''){
                top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: ${item.url} [Gold answer]</div></div></div>
	 			`
            }
            else {
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: <a href="${item.url}" target="_blank">${item.label}</a> [Gold answer]</div></div></div>
	 			`
                }

        }
        else if (answerList.indexOf(item.label + 'T00:00:00Z')  !== -1){
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: ${item.label} [Gold answer]</div></div></div>
	 			`
        }
        else if (answerList.indexOf(item.label)  !== -1){
            if (item.url === '') {
            top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: ${item.label} [Gold answer]</div></div></div>
	 			`
            }
            else{
                top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: <a href="${item.url}" target="_blank">${item.label}</a> [Gold answer]</div></div></div>
	 			`}

        }
        else {
            if (item.url === '') {
                top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: ${item.label}</a> </div></div></div>
	 			`
            }
            else {
        top5 += `
                 <div class="queansLine"><div class="queans"><div class="queansCon">
                 Top-${item.rank}: <a href="${item.url}" target="_blank">${item.label}</a> </div></div></div>
	 			`}}
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

function subFeedBack() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth()+1;
        var day = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        let str = $('#exampleFormControlTextarea1').val()
        if (str.length <= 0) return alert('Nothing to submit. Please provide your feedback.')
        let data = {
            "content": str,
            "year": year,
            "month": month,
            "day": day,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds,
            }
        $.ajax({
            url: '/feedback',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: 'json',

           success: function (res) {
                console.log(res)
                alert('Thanks a lot for your feedback!')
            },
            error: function (xhr) {
                console.log('error', xhr)
            },
            complete: function (xhr) {

                $('#exampleFormControlTextarea1').val('')
            }
        })
    }


function reloadqkg() {
    //qkgfact.dispose();
    if (qkgfact !== undefined) {
        qkgfact.dispose()
    }
    console.log(qkgfactUrl_onlick)
    loadqkg(qkgfactUrl_onlick)
}
function loadqkg(qkgfactUrl) {
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
                name: 'Terminal (NERD) entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#FAC858',
                    //color: '#ffe699',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity' //category name
            };
        categories[1] =
            {
                name: 'Terminal (NERD) entity (gold answer)',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#FAC858',
                    //color: '#ffe699',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity (gold answer)' //category name
            };
        categories[2] = {
            name: 'Gold answer',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#7fe874',
                color: '#FAC858',
                    //color: '#ffe699',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Ground truth' //category name
        };
        categories[3] =
            {
                name: 'Entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#FAC858',
                    //color: '#ffe699',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Entity' //category name
            };
        // categories[3] = {
        //     name: 'Connectivity entity',
        //     symbol: 'circle',
        //     symbolSize: 40,
        //     itemStyle: {
        //         //color: '#4682b4',
        //         color: '#FAC858',
        //             //color: '#ffe699',
        //         borderType: 'solid',
        //         borderColor: '#FF0000',
        //         borderWidth: 3,
        //     },
        //     label: {
        //         show: true,
        //         position: 'right',
        //         color: '#5D3914FF'
        //     },
        //
        //     base: 'Connectivity entity' //category name
        // };
        categories[4] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#FAC858',
                    //color: '#ffe699',
                borderType: 'solid',
                //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };
        categories[5] = {
            name: 'Predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#FFFFFF',
                color: '#FAC858',
                    //color: '#ffe699',
                //borderColor: '#0000FF',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Predicate' //category name
        };

        // categories[6] = {
        //     name: 'Connectivity predicate',
        //     symbol: 'triangle',
        //     symbolSize: 40,
        //     itemStyle: {
        //         //color: '#4682b4',
        //         color: '#FAC858',
        //             //color: '#ffe699',
        //         borderType: 'solid',
        //         borderColor: '#FF0000',
        //         borderWidth: 3,
        //     },
        //     label: {
        //         show: true,
        //         position: 'right',
        //         color: '#5D3914FF'
        //     },
        //     base: 'Connectivity predicate' //category name
        // };
        let nodes = []
        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map()
                    .set(0, {name: 'Terminal (NERD) entity',
                    icon: "circle",
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
             .set(1, {name: 'Terminal (NERD) entity (gold answer)',
                    icon: "circle",
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
        .set(2, {name: 'Gold answer',
                    icon: "circle",
                    })
            .set(3, { name: 'Entity',
                     icon: 'circle',
                     })
        // .set(3, {name: 'Connectivity entity',
        //             icon: "circle",
        //             })

        .set(4, {name: 'Terminal predicate',
                 icon: "triangle",
                 })
        .set(5,{name: 'Predicate',
                     icon: 'triangle',
                     })
        // .set(6, {name: 'Connectivity predicate',
        //          icon: "triangle",})

        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.method === "Question relevant facts" || node.attributes.method === "Injecting connectivity"){
            if (node.attributes.type === "subject/object"  && node.attributes.seed === true && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true && node.attributes.ground === true) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === true) {
                node.category = 2;
            }
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 3;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === false) {
                node.category = 5;
            }
            else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
                node.category = 4;
            }
            }
            // else if (node.attributes.method === "Injecting connectivity"){
            //     if (node.attributes.type === "subject/object") {
            //         node.category = 3;
            //     }
            //     else if (node.attributes.type === "predicate") {
            //         node.category = 6;
            //     }
            //
            // }

            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        //console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                legend_data.push(v)
            }
        }
        //console.info(categories_dic);
        //console.info(legend_data);

        let links = []
        graph.links.forEach((item, index) => {
            const source = nodes.indexOf(item.source)
            const target = nodes.indexOf(item.target)
            links.push({
                name: item.name,
                source: source,
                target: target,
                lineStyle: {
                    opacity: 0.5,
                    width: 5,
                    color: '#271b12',
                    curveness: 0

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
                    if (x.data.hasOwnProperty("attributes")){
                        if (x.data.attributes.hasOwnProperty("type")){
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    } else {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }}
                else{
                    return '<div style=" "> Question relevance score rank: ' + x.data.name + "<br>"
                    }
                }
            },
            legend: {
                //backgroundColor: '#ccc',
            data: legend_data,
                selectedMode: 'multiple',
                selected:{
                 'Terminal (NERD) entity':true,
                  'Terminal (NERD) entity (gold answer)':true,
                 'Terminal predicate': true,
                 'Gold answer': true,
                  'Entity': true,
                   'Predicate':true,

                 //'Connectivity predicate': true,
                 //'Connectivity entity': true,
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
                    focus: 'adjacency',
                    force: {
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        show: true,
                        fontSize: 11,

                            formatter: function (x) {
                                return x.data.name
                            }
                        },
                    lineStyle: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0

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
}

function reloadgst() {
    //union.dispose();
    if (union !== undefined) {
        union.dispose()
    }
    console.log(gstUrl_onlick)
    loadgst(gstUrl_onlick)
}

function loadgst(unionGSTUrl) {
    union = echarts.init(document.getElementById('union'))
    union.showLoading();
    $.get('static/graph/demo_visual_gst/' + unionGSTUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        let categories = [];
        union.hideLoading();
        categories[0] =
            {
                name: 'GSTs entity',
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
                base: 'GSTs entity' //category name
            };
        categories[1] =
            {
                name: 'Terminal (NERD) entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity' //category name
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
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Gold answer' //category name
        };
        categories[3] = {
            name: 'GSTs predicate',
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
            base: 'GSTs predicate' //category name
        };
        categories[4] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };
        categories[5] =
            {
                name: 'Terminal (NERD) entity (gold answer)',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity (gold answer)' //category name
            };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map()
            .set(1, {name: 'Terminal (NERD) entity',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 3,
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
            .set(5, {name: 'Terminal (NERD) entity (gold answer)',
                    icon: "circle",
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
             .set(2, {name: 'Gold answer',
                    icon: "circle",
                    })
            .set(0, { name: 'GSTs entity',
                    icon: 'circle',
                    })
            .set(4, {name: 'Terminal predicate',
                 icon: "triangle",
                 })
        .set(3,{name: 'GSTs predicate',
                     icon: 'triangle',
                     })


        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.type === "subject/object" && node.attributes.seed === false && node.attributes.ground === false) {
                node.category = 0;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true && node.attributes.ground === false) {
                node.category = 1;
            }
            else if (node.attributes.type === "subject/object"  && node.attributes.seed === true && node.attributes.ground === true) {
                node.category = 5;
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
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
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
                    //normal: {
                        opacity: 0.5,
                        width: 5,
                        color: '#271b12',
                        curveness: 0
                    //}
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
                    if (x.data.hasOwnProperty("attributes")){
                        if (x.data.attributes.hasOwnProperty("type")){
                    if (x.data.attributes.type === 'predicate') {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                    } else {
                        return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }}
                else{
                    return '<div style=" "> Question relevance score rank: ' + x.data.name + "<br>"
                    }
                }
            },
            legend: {
            data: legend_data,
                selected:{
                'Terminal (NERD) entity':true,
                 'Terminal (NERD) entity (gold answer)':true,
                 'Gold answer': true,
                 'GSTs entity': true,
                 'GSTs predicate':true,
                 'Terminal predicate': true,

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
                    focus: 'adjacency',
                    force: {
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        //normal: {
                            show: true,
                            //textStyle: {
                                fontSize: 11,
                            //},
                            formatter: function (x) {
                                return x.data.name
                            }
                        //}
                    },

                    lineStyle: {
                        //normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        //}
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
}

function reloadcomgst() {
    //completeGST.dispose();
    if (completeGST !== undefined) {
        completeGST.dispose()
    }
    console.log(comgstUrl_onlick)
    loadcomgst(comgstUrl_onlick)
}

function loadcomgst(completeGSTUrl) {
    completeGST = echarts.init(document.getElementById('completeGST'))
    completeGST.showLoading();
    $.get('static/graph/demo_visual_comgst/' + completeGSTUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        // console.info(graph)
        let categories = [];
        let types = [];
        completeGST.hideLoading();
        categories[0] =
            {
                name: 'GSTs entity',
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
                base: 'GSTs entity' //category name
            };
        categories[1] =
            {
                name: 'Terminal (NERD) entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity' //category name
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
                borderWidth: 2,
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
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Gold answer in completed GSTs' //category name
        };
        categories[5] = {
            name: 'GSTs predicate',
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
            base: 'GSTs predicate' //category name
        };
        categories[6] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
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
        let categories_dic = new Map()
            // .set(0, { name: 'GSTs entity',
            //         icon: 'circle',
            //         })
                    .set(1, {name: 'Terminal (NERD) entity',
                    icon: "circle",
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
        .set(2, {name: 'Gold answer in GSTs',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 2,
                    borderColor: '#65B95C',
                    })
        .set(3, {name: 'Completed entity',
                    icon: "circle",
                    })
            .set(4, {name: 'Gold answer in completed GSTs',
                 icon: "circle",
                    borderType: 'solid',
                    borderWidth: 2,
                    borderColor: '#65B95C',})
        // .set(5,{name: 'GSTs predicate',
        //              icon: 'triangle',
        //              })
        .set(6, {name: 'Terminal predicate',
                 icon: "triangle",
                borderType: 'solid',
                borderWidth: 2,
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
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
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
                    //normal: {
                        opacity: 0.5,
                        width: 5,
                        color: '#271b12',
                        curveness: 0
                    //}
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
                    if (x.data.hasOwnProperty("attributes")){
                    if (x.data.attributes.hasOwnProperty('type')) {
                        if (x.data.attributes.type === 'predicate') {
                            return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                        } else {
                            return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                        }
                    }}
                    else{
                    return '<div style=" "> Question relevance score rank: ' + x.data.name + "<br>"
                    }
                }

            },
            legend: {

            data: legend_data,
                 selected:{
                //'GSTs entity': true,
                 'NERD entity':true,
                 //'GSTs predicate':true,
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
                    focus: 'adjacency',
                    force: {
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        //normal: {
                            show: true,
                            //textStyle: {
                                fontSize: 11,
                            //},
                            formatter: function (x) {
                                return x.data.name
                            }
                        //}
                    },

                    lineStyle: {
                        //normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        //}
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

}

function reloadtemenh() {
    //temp.dispose();
    if (temp !== undefined) {
        temp.dispose()
    }
    console.log(temenhUrl_onlick)
    loadtemenh(temenhUrl_onlick)
}

function loadtemenh(tempUrl) {
    temp = echarts.init(document.getElementById('temp'))
    temp.showLoading();
    $.get('static/graph/demo_visual_temenhance/' + tempUrl, function (xml) {
        let graph = dataTool.gexf.parse(xml);
        let categories = [];
        temp.hideLoading();
        categories[0] =
            {
                name: 'Entity from GSTs',
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
                base: 'Entity from GSTs' //category name
            };
        categories[1] =
            {
                name: 'Terminal (NERD) entity',
                symbol: "circle",
                symbolSize: 40,
                itemStyle: {
                    //color: '#ffc000',
                    color: '#ffc000',
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Terminal (NERD) entity' //category name
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
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },

            base: 'Gold answer in GSTs' //category name
        };
        categories[3] = {
            name: 'Entity from completed GSTs',
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

            base: 'Entity from completed GSTs' //category name
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
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Gold answer in completed GSTs' //category name
        };
        categories[5] = {
            name: 'Entity from enhanced temporal fact',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                //color: '#99dff9',
                color: '#73C0DE',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Entity from enhanced temporal fact' //category name
        };
        categories[6] = {
            name: 'Gold answer in enhanced temporal fact',
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                //color: '#99dff9',
                color: '#73C0DE',
                borderType: 'solid',
                borderColor: '#65B95C',
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Gold answer in enhanced temporal fact' //category name
        };
        categories[7] = {
            name: 'Predicate from GSTs',
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
            base: 'Predicate from GSTs' //category name
        };
        categories[8] = {
            name: 'Terminal predicate',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#ffc000',
                color: '#ffc000',
                borderType: 'solid',
                //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Terminal predicate' //category name
        };

        categories[9] = {
            name: 'Predicate from completed GSTs',
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
            base: 'Predicate from completed GSTs' //category name
        };

        categories[10] = {
            name: 'Predicate from enhanced temporal fact',
            symbol: 'triangle',
            symbolSize: 40,
            itemStyle: {
                //color: '#4682b4',
                color: '#73C0DE',
            },
            label: {
                show: true,
                position: 'right',
                color: '#5D3914FF'
            },
            base: 'Predicate from enhanced temporal fact' //category name
        };

        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map()
                    .set(1, {name: 'Terminal (NERD) entity',
                    icon: "circle",
                    borderType: 'solid',
                    //borderColor: '#2F528F',
                    borderColor: '#5470C6',
                    borderWidth: 2,
                    })
                    // .set(0, { name: 'Entity from GSTs',
                    // icon: 'circle',
                    // })
                    .set(2, {name: 'Gold answer in GSTs',
                    icon: "circle",
                    borderType: 'solid',
                    borderWidth: 2,
                    borderColor: '#65B95C',
                    })
                    // .set(3, {name: 'Entity from completed GSTs',
                    // icon: "circle",
                    // })
                    .set(4, {name: 'Gold answer in completed GSTs',
                 icon: "circle",
                    borderType: 'solid',
                    borderWidth: 2,
                    borderColor: '#65B95C',})
                    .set(5, { name: 'Entity from enhanced temporal fact',
                    icon: 'circle',
                    })
                .set(6, { name: 'Gold answer in enhanced temporal fact',
                    icon: 'circle',
                    borderType: 'solid',
                    borderWidth: 2,
                    borderColor: '#65B95C',
                    //borderColor: '#91CC75',
                    })
            // .set(7,{name: 'Predicate from GSTs',
            //          icon: 'triangle',
            //          })
            .set(8, {name: 'Terminal predicate',
                 icon: "triangle",
                borderType: 'solid',
                borderWidth: 3,
                borderColor: '#2F528F',
                 })
        // .set(9, {name: 'Predicate from completed GSTs',
        //          icon: "triangle",})
        .set(10, {name: 'Predicate from enhanced temporal fact',
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
            // else if (node.attributes.type === "predicate") {
            //     node.category = 7;
            // }
            // else if (node.attributes.type === "predicate" && node.attributes.cornerstone === true) {
            //     node.category = 8;
            // }
            }
            else if (node.attributes.method === "CompletedGSTs") {
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
            else if (node.attributes.method === "TemporalEnhanced"){
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
        //console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                //console.info(v);
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
                    if (x.data.hasOwnProperty("attributes")) {
                        if (x.data.attributes.hasOwnProperty('type')) {
                            if (x.data.attributes.type === 'predicate') {
                                return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>"

                            } else {
                                return '<div style=" "> Label: ' + x.data.attributes.label + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> Method: ' + x.data.attributes.method + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.seed + "<br>" + '<div style=" "> Terminal: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                            }
                        }
                    }
                    // else{
                    // return '<div style=" "> Vertex-1: ' + x.data.source.split("::")[0] + "<br>" + '<div style=" "> Vertex-2: ' + x.data.target.split("::")[0] + "<br>"
                    // }
                }
            },
            legend: {
            data: legend_data,
                selected:{
                    //'Entity from GSTs': true,
                 'Terminal (NERD) entity':true,
                 'Gold answer in GSTs': true,
                 //'Entity from completed GSTs': true,
                 'Gold answer in completed GSTs': true,
                 'Entity from enhanced temporal fact': true,
                 'Gold answer in enhanced temporal fact': true,
                 //'Predicate from GSTs':true,
                 'Terminal predicate': true,
                 //'Predicate from completed GSTs': true,
                 'Predicate from enhanced temporal fact': true,
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
                    focus: 'adjacency',
                    force: {
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {},

                    lineStyle: {
                        //normal: {
                            opacity: 0.5,
                            width: 1,
                            color: '#271b12',
                            curveness: 0
                        //}
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

}

function reloadanspre() {
    //relg.dispose();
    if (relg !== undefined) {
        relg.dispose()
    }
    console.log(anspretUrl_onlick)
    loadanspre(anspretUrl_onlick)
}
function loadanspre(relgUrl) {
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
                symbolSize: 90,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    //color: '#99dff9',
                    color: '#91CC75',
                    //borderType: 'solid',
                    //borderWidth: 3,
                    //borderColor: '#2F528F',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity' //category name
            };
        categories[1] =
            {
                name: 'NERD entity (Top-1 candidate)',
                symbol: "circle",
                symbolSize: 90,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    //color: '#99dff9',
                    color: '#9A60B4',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity (Top-1 candidate)' //category name
            };

         categories[2] =
            {
                name: 'Top-1 candidate',
                symbol: "circle",
                symbolSize: 70,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    //color: '#ffc000',
                    color: '#9A60B4',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Top-1 candidate' //category name
            };

         categories[3] =
            {
                name: 'Top-2 candidate',
                symbol: "circle",
                symbolSize: 65,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#EA7CCC',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Top-2 candidate' //category name
            };
         categories[4] =
            {
                name: 'NERD entity (Top-2 candidate)',
                symbol: "circle",
                symbolSize: 65,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#EA7CCC',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity (Top-2 candidate)' //category name
            };

         categories[5] =
            {
                name: 'Top-3 candidate',
                symbol: "circle",
                symbolSize: 60,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#FC8452',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Top-3 candidate' //category name
            };

         categories[6] =
            {
                name: 'NERD entity (Top-3 candidate)',
                symbol: "circle",
                symbolSize: 60,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#FC8452',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity (Top-3 candidate)' //category name
            };

         categories[7] =
            {
                name: 'Top-4 candidate',
                symbol: "circle",
                symbolSize: 55,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#FAC858',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Top-4 candidate' //category name
            };

         categories[8] =
            {
                name: 'NERD entity (Top-4 candidate)',
                symbol: "circle",
                symbolSize: 55,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#FAC858',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity (Top-4 candidate)' //category name
            };

         categories[9] =
            {
                name: 'Top-5 candidate',
                symbol: "circle",
                symbolSize: 50,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#5470C6',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Top-5 candidate' //category name
            };

         categories[10] =
            {
                name: 'NERD entity (Top-5 candidate)',
                symbol: "circle",
                symbolSize: 50,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    color: '#5470C6',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'NERD entity (Top-5 candidate)' //category name
            };

         categories[11] =
            {
                name: 'St-ID',
                symbol: "circle",
                symbolSize: 10,
                itemStyle: {
                    //color: '#FFFFFF',
                    color: '#807E7A',
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'St-ID' //category name
            };

            categories[12] =
            {
                name: 'Other entities',
                symbol: "circle",
                symbolSize: 20,
                itemStyle: {
                    //color: '#FFFFFF',
                    //color: '#ffc000',
                    //color: '#99dff9',
                    color: '#73C0DE',
                    //borderColor: '#2F528F',

                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#5D3914FF',

                },
                base: 'Other entities' //category name
            };
        let legend_data = []
        let categories_vary = new Set()
        let categories_dic = new Map()
            .set(0, { name: 'NERD entity',
                    icon: 'circle',
                    })
            .set(1, { name: 'NERD entity (Top-1 candidate)',
                    icon: 'circle',
                    })
            .set(2, {name: 'Top-1 candidate',
                    icon: "circle",
                    })
            .set(3, {name: 'Top-2 candidate',
                    icon: "circle",
                    })
            .set(4, {name: 'NERD entity (Top-2 candidate)',
                    icon: "circle",
                    })
            .set(5, {name: 'Top-3 candidate',
                    icon: "circle",
                    })
            .set(6, {name: 'NERD entity (Top-3 candidate)',
                    icon: "circle",
                    })
            .set(7, {name: 'Top-4 candidate',
                    icon: "circle",
                    })
            .set(8, {name: 'NERD entity (Top-4 candidate)',
                    icon: "circle",
                    })
            .set(9, {name: 'Top-5 candidate',
                    icon: "circle",
                    })
            .set(10, {name: 'NERD entity (Top-5 candidate)',
                    icon: "circle",
                    })
            .set(11, {
                name: 'St-ID',
                icon: "circle",
            })
            .set(12, {
                name: 'Other entities',
                icon: "circle",
            })

        let nodes = []
        graph.nodes.forEach(function (node) {
            node.name = node.name;
            if (node.attributes.type === "St-ID"){
                node.category = 11;
            }
            else {
            if (node.attributes.cornerstone === true){
                if (node.attributes.top === true){
                if (node.attributes.rank === "1"){
                    node.category = 1;
                }
                else if (node.attributes.rank === "2"){
                    node.category = 4;
                }
                else if (node.attributes.rank === "3"){
                    node.category = 6;
                }
                else if (node.attributes.rank === "4"){
                    node.category = 8;
                }
                else if (node.attributes.rank === "5"){
                    node.category = 10;
                }}
                else {node.category = 0;}

            }
            else if (node.attributes.cornerstone === false) {
                if (node.attributes.rank === "1") {
                    node.category = 2;
                } else if (node.attributes.rank === "2") {
                    node.category = 3;
                } else if (node.attributes.rank === "3") {
                    node.category = 5;
                } else if (node.attributes.rank === "4") {
                    node.category = 7;
                } else if (node.attributes.rank === "5") {
                    node.category = 9;
                } else if (node.attributes.rank === "none") {
                    node.category = 12;
                }
            }}
            categories_vary.add(node.category);
            nodes.push(node.id);
        });
        //console.info(categories_vary);
        for (let [k,v] of categories_dic){
            if (categories_vary.has(k)){
                //console.info(v);
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
                    //normal: {
                        opacity: 0.5,
                        //width: 5,
                        color: '#271b12',
                        curveness: 0
                    //}
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
                    if (x.data.hasOwnProperty("attributes")){
                    if (x.data.attributes.hasOwnProperty('type')){
                    if (x.data.attributes.type === 'St-ID'){
                        return '<div style=" "> intermediate node'
                    }
                    if (x.data.attributes.top === false){
                        return '<div style=" "> Label: ' + x.data.name + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Top5 answer: ' + x.data.attributes.top + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                    else{
                        return '<div style=" "> Label: ' + x.data.name + "<br>" + '<div style=" "> Type: ' + x.data.attributes.type + "<br>" + '<div style=" "> NERD: ' + x.data.attributes.cornerstone + "<br>" + '<div style=" "> Top5 answer: ' + x.data.attributes.top + "<br>" + '<div style=" "> Rank: ' + x.data.attributes.rank + "<br>" + '<div style=" "> Gold answer: ' + x.data.attributes.ground
                    }
                }}
                    else{

                    return '<div style=" "> Label: ' + x.data.name.split(": ")[0] + "<br>" + '<div style=" "> Attention weight rank: ' + x.data.name.split(": ")[1] + "<br>"
                    }

                }
            },
            legend: {
                data: legend_data,
                selected:{
                    'NERD entity':true,
                    'NERD entity (Top-1 candidate)':true,
                    'NERD entity (Top-2 candidate)':true,
                    'NERD entity (Top-3 candidate)':true,
                    'NERD entity (Top-4 candidate)':true,
                    'NERD entity (Top-5 candidate)':true,
                    'Top-1 candidate':true,
                    'Top-2 candidate':true,
                    'Top-3 candidate':true,
                    'Top-4 candidate':true,
                    'Top-5 candidate':true,
                    'St-ID':true,
                    'Other entities':true,
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
                    focus: 'adjacency',
                    force: {
                        //initLayout: 'circular',
                        layoutAnimation: true,
                        edgeLength: [100, 120],
                        repulsion: [1000, 1600],
                        gravity: 0.2
                    },
                    edgeLabel: {
                        //normal: {
                            show: true,
                            //textStyle: {
                                fontSize: 14,
                        color: '#5D3914FF',
                                //color: '#000000',
                            //},
                            formatter: function (x) {
                                return x.data.name
                            }
                        //}
                    },
                    lineStyle: {
                        opacity: 0.5,
                        //width: 2.5,
                        color: '#271b12',
                        curveness: 0,

                }
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

function appendQCard(data) {
    $('#qCard').show()
    $('#qCard h5 span').html(`"${data['Question truecase']}"`)
    //console.log(data.Id)
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
    qkgfactUrl_onlick  = qkgfactUrl
    loadqkg(qkgfactUrl_onlick)
    gstUrl_onlick  = unionGSTUrl
    loadgst(gstUrl_onlick)
    comgstUrl_onlick = completeGSTUrl
    loadcomgst(comgstUrl_onlick)
    temenhUrl_onlick = tempUrl
    loadtemenh(temenhUrl_onlick)
    anspretUrl_onlick = relgUrl
    loadanspre(anspretUrl_onlick)





}

