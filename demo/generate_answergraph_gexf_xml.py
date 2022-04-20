import json
import networkx as nx
import globals
import pickle
import gexf
import xml.etree.ElementTree as ET
import os

def add_XMLNS_attributes(tree, xmlns_uris_dict):
    if not ET.iselement(tree):
        tree = tree.getroot()
    for prefix, uri in xmlns_uris_dict.items():
        tree.attrib['xmlns:' + prefix] = uri

def get_answer(question):
    """extract unique answers from dataset."""
    GT = list()
    answers = question["Answer"]
    print (answers)
    for answer in answers:
        if "AnswerType" in answer:
            if answer["AnswerType"] == "Entity":
                GT.append(answer["WikidataQid"])
            else:
                GT.append(answer["AnswerArgument"])
    print (GT)
    return GT

def _read_corners(cornerstone_file):
    corner_entities = []
    data = pickle.load(open(cornerstone_file, 'rb'))
    for key in data:
        if key.strip().split("::")[1] == "Entity":
            corner_entities.append(key.strip().split("::")[2])
    return list(data.keys()), corner_entities

def add_viz_for_qkg_gst_comp_graph(demo_graph, addcolor_demo_graph):
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")
    tree = ET.parse(demo_graph)
    root = tree.getroot()
    xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
    add_XMLNS_attributes(root, xmlns_uris)

    for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
        #print(edge.attrib)
        shape = ET.SubElement(edge, 'viz:shape')
        shape.set('value', 'solid')
        size = ET.SubElement(edge, 'viz:thickness')
        #size.set('value', '1')
        try:
            rank = edge.attrib['label']
        except:
            print(demo_graph)
            break
        if int(rank) == 1:
            size.set('value', '10')
        elif int(rank) == 2:
            size.set('value', '8')
        elif int(rank) == 3:
            size.set('value', '6')
        elif int(rank) == 4:
            size.set('value', '4')
        elif int(rank) == 5:
            size.set('value', '3')
        elif int(rank) >= 6 and int(rank) <= 10:
            size.set('value', '2')
        else:
            size.set('value', '1')

    tree.write(addcolor_demo_graph, encoding="utf-8", xml_declaration=True)

def get_QKGgexf_graph_xml(output_file_path, G, corner_nodes, corner_entities, seed_entity, ground_truth, spo_file, spo_rank_file, method):
    #T = nx.Graph()
    spo_rank = pickle.load(open(spo_rank_file, 'rb'))
    hit_sta = []
    for key, value in spo_rank.items():
        sta_id = value.split('\t')[0]
        if int(key) <= 25:
            hit_sta.append(sta_id)

    qkgentity = []
    with open(spo_file, 'r', encoding='utf-8') as f11:
        for line in f11:
            triple = line.strip().split('||')
            if len(triple) < 7 or len(triple) > 7: continue
            sta_id = triple[0]
            statement_id = sta_id.replace("-ps:", "").replace("-pq:", "").lower()
            n1_id = triple[1]
            n3_id = triple[5]
            if n1_id.startswith('corner#'):
                n1_id = n1_id.replace('corner#', '')
                n11 = n1_id.split('#')
                n1_id = n11[0]
            if n3_id.startswith('corner#'):
                n3_id = n3_id.replace('corner#', '')
                n33 = n3_id.split('#')
                n3_id = n33[0]
            if statement_id in hit_sta:
                qkgentity.append(n1_id)
                qkgentity.append(n3_id)


    weight = []
    for index, edge in enumerate(G.edges()):
        data = G.get_edge_data(edge[0], edge[1])
        if data['weight'] not in weight:
            weight.append(data['weight'])
    weight.sort(reverse=True)


    mygexf = gexf.Gexf("Zhen Jia", "Question-relevant Facts")
    gexf_graph = mygexf.addGraph("undirected", "static", "Question-relevant Facts")
    # attributes
    label_attr = gexf_graph.addNodeAttribute(force_id='label', title='Label', type='string', defaultValue='')
    type_attr = gexf_graph.addNodeAttribute(force_id='type', title='Type', type='string', defaultValue='subject/object')
    corner_attr = gexf_graph.addNodeAttribute(force_id='cornerstone', title='Cornerstone', type='boolean', defaultValue='false')
    ground_attr = gexf_graph.addNodeAttribute(force_id='ground', title='GroundTruth', type='boolean', defaultValue='false')
    seed_attr = gexf_graph.addNodeAttribute(force_id='seed', title='NERD', type='boolean', defaultValue='false')
    method_attr = gexf_graph.addNodeAttribute(force_id='method', title='Method', type='string', defaultValue=method)

    for n in G.nodes():
        name = n.split('::')[0]
        type = n.split('::')[1]
        id = n.split('::')[2]
        node = gexf_graph.addNode(n, name)
        node.addAttribute(label_attr, name)
        node.addAttribute(method_attr, method)
        if id in seed_entity:
            node.addAttribute(seed_attr, 'true')
        else:
            node.addAttribute(seed_attr, 'false')
        if n in corner_nodes or id in corner_entities:
            node.addAttribute(corner_attr, 'true')
        else:
            node.addAttribute(corner_attr, 'false')
        if id in ground_truth or id.replace("T00:00:00Z", "") in ground_truth:
            node.addAttribute(ground_attr, 'true')
        else:
            node.addAttribute(ground_attr, 'false')
        if type != 'Entity':
            node.addAttribute(type_attr, 'predicate')
            if id not in hit_sta:
                node.addAttribute(method_attr, "Injecting connectivity")
        elif type == 'Entity':
            node.addAttribute(type_attr, 'subject/object')
            if id not in qkgentity:
                node.addAttribute(method_attr, "Injecting connectivity")

    for index, edge in enumerate(G.edges()):
        data = G.get_edge_data(edge[0], edge[1])
        gexf_graph.addEdge(index, edge[0], edge[1], weight = data['weight'], label = str(weight.index(data['weight']) + 1))
    output_file = open(output_file_path, 'wb')
    mygexf.write(output_file)
    output_file.close()
    return gexf_graph

def get_GSTgexf_graph_xml(output_file_path, G, corner_nodes, corner_entities, seed_entity, ground_truth, QKG, method):

    mygexf = gexf.Gexf("Zhen Jia", "GSTs Graph")
    gexf_graph = mygexf.addGraph("undirected", "static", "GSTs Graph")
    # attributes
    label_attr = gexf_graph.addNodeAttribute(force_id='label', title='Label', type='string', defaultValue='')
    type_attr = gexf_graph.addNodeAttribute(force_id='type', title='Type', type='string', defaultValue='subject/object')
    corner_attr = gexf_graph.addNodeAttribute(force_id='cornerstone', title='Cornerstone', type='boolean', defaultValue='false')
    ground_attr = gexf_graph.addNodeAttribute(force_id='ground', title='GroundTruth', type='boolean', defaultValue='false')
    seed_attr = gexf_graph.addNodeAttribute(force_id='seed', title='NERD', type='boolean', defaultValue='false')
    method_attr = gexf_graph.addNodeAttribute(force_id='method', title='Method', type='string', defaultValue=method)

    weight = []
    for index, edge in enumerate(QKG.edges()):
        data = QKG.get_edge_data(edge[0], edge[1])
        if data['weight'] not in weight:
            weight.append(data['weight'])
    weight.sort(reverse=True)

    for n in G.nodes():
        name = n.split('::')[0]
        type = n.split('::')[1]
        id = n.split('::')[2]
        node = gexf_graph.addNode(n, name)
        node.addAttribute(label_attr, name)
        node.addAttribute(method_attr, method)
        if id in seed_entity:
            node.addAttribute(seed_attr, 'true')
        else:
            node.addAttribute(seed_attr, 'false')
        if n in corner_nodes or id in corner_entities:
            node.addAttribute(corner_attr, 'true')
        else:
            node.addAttribute(corner_attr, 'false')
        if id in ground_truth or id.replace("T00:00:00Z", "") in ground_truth:
            node.addAttribute(ground_attr, 'true')
        else:
            node.addAttribute(ground_attr, 'false')
        if type != 'Entity':
            node.addAttribute(type_attr, 'predicate')
        else:
            node.addAttribute(type_attr, 'subject/object')

    for index, edge in enumerate(G.edges()):
        if (edge[0], edge[1]) in QKG.edges():
            data = QKG.get_edge_data(edge[0], edge[1])
        gexf_graph.addEdge(index, edge[0], edge[1], weight=data['weight'], label=str(weight.index(data['weight']) + 1))
    output_file = open(output_file_path, 'wb')
    mygexf.write(output_file)
    output_file.close()
    return gexf_graph

def get_comgexf_nxgraph_xml(output_file_path, G, corner_nodes, corner_entities, seed_entity, ground_truth, source_graph, QKG, method):
    mygexf = gexf.Gexf("Zhen Jia", method + " Graph")
    gexf_graph = mygexf.addGraph("undirected", "static", method + " Graph")

    weight = []
    for index, edge in enumerate(QKG.edges()):
        data = QKG.get_edge_data(edge[0], edge[1])
        if data['weight'] not in weight:
            weight.append(data['weight'])
    weight.sort(reverse=True)

    # attributes
    label_attr = gexf_graph.addNodeAttribute(force_id='label', title='Label', type='string', defaultValue='')
    type_attr = gexf_graph.addNodeAttribute(force_id='type', title='Type', type='string', defaultValue='subject/object')
    corner_attr = gexf_graph.addNodeAttribute(force_id='cornerstone', title='Cornerstone', type='boolean',
                                              defaultValue='false')
    ground_attr = gexf_graph.addNodeAttribute(force_id='ground', title='GroundTruth', type='boolean',
                                              defaultValue='false')
    seed_attr = gexf_graph.addNodeAttribute(force_id='seed', title='NERD', type='boolean', defaultValue='false')
    method_attr = gexf_graph.addNodeAttribute(force_id='method', title='Method', type='string', defaultValue=method)

    for n in G.nodes():
        name = n.split('::')[0]
        type = n.split('::')[1]
        id = n.split('::')[2]
        node = gexf_graph.addNode(n, name)
        node.addAttribute(label_attr, name)
        if n in source_graph.nodes():
            node.addAttribute(method_attr, 'GSTs')
        else:
            node.addAttribute(method_attr, method)
        if type == 'Entity':
            node.addAttribute(type_attr, 'subject/object')

        if type != 'Entity':
            node.addAttribute(type_attr, 'predicate')

        if id in seed_entity:
            node.addAttribute(seed_attr, 'true')
        else:
            node.addAttribute(seed_attr, 'false')
        if n in corner_nodes or id in corner_entities:
            node.addAttribute(corner_attr, 'true')
        else:
            node.addAttribute(corner_attr, 'false')
        if id in ground_truth or id.replace("T00:00:00Z", "") in ground_truth:
            node.addAttribute(ground_attr, 'true')
        else:
            node.addAttribute(ground_attr, 'false')

    for index, edge in enumerate(G.edges()):
        if (edge[0], edge[1]) in QKG.edges():
            data = QKG.get_edge_data(edge[0], edge[1])
        gexf_graph.addEdge(index, edge[0], edge[1], weight=data['weight'], label=str(weight.index(data['weight']) + 1))

    output_file = open(output_file_path, 'wb')
    mygexf.write(output_file)
    output_file.close()
    return gexf_graph


def get_enhancegexf_fromcom_nxgraph_xml(output_file_path, completeGST_tempen, GST, completedGST, corner_nodes, corner_entities, seed_entity, ground_truth, method):
    mygexf = gexf.Gexf("Zhen Jia", method + " Graph")
    gexf_graph = mygexf.addGraph("undirected", "static", method + " Graph")

    # attributes
    label_attr = gexf_graph.addNodeAttribute(force_id='label', title='Label', type='string', defaultValue='')
    type_attr = gexf_graph.addNodeAttribute(force_id='type', title='Type', type='string', defaultValue='subject/object')
    corner_attr = gexf_graph.addNodeAttribute(force_id='cornerstone', title='Cornerstone', type='boolean',
                                              defaultValue='false')
    ground_attr = gexf_graph.addNodeAttribute(force_id='ground', title='GroundTruth', type='boolean',
                                              defaultValue='false')
    seed_attr = gexf_graph.addNodeAttribute(force_id='seed', title='NERD', type='boolean', defaultValue='false')
    method_attr = gexf_graph.addNodeAttribute(force_id='method', title='Method', type='string', defaultValue=method)

    for n in completeGST_tempen.nodes():
        name = n.split('::')[0]
        type = n.split('::')[1]
        id = n.split('::')[2]
        node = gexf_graph.addNode(n, name)
        node.addAttribute(label_attr, name)
        if n in GST.nodes():
            node.addAttribute(method_attr, "GSTs")
        elif n in completedGST.nodes():
            node.addAttribute(method_attr, "CompletedGSTs")
        else:
            node.addAttribute(method_attr, "TemporalEnhanced")
        if type == 'Entity':
            node.addAttribute(type_attr, 'subject/object')
        if type != 'Entity':
            node.addAttribute(type_attr, 'predicate')
        if id in seed_entity:
            node.addAttribute(seed_attr, 'true')
        else:
            node.addAttribute(seed_attr, 'false')
        if n in corner_nodes or id in corner_entities:
            node.addAttribute(corner_attr, 'true')
        else:
            node.addAttribute(corner_attr, 'false')
        if id in ground_truth or id.replace("T00:00:00Z", "") in ground_truth:
            node.addAttribute(ground_attr, 'true')
        else:
            node.addAttribute(ground_attr, 'false')

    for index, edge in enumerate(completeGST_tempen.edges()):
        gexf_graph.addEdge(index, edge[0], edge[1])
    output_file = open(output_file_path, 'wb')
    mygexf.write(output_file)
    output_file.close()
    return gexf_graph


if __name__ == "__main__":
    # prepare data...
    print("\n\nPrepare data and start...")
    cfg = globals.get_config(globals.config_file)
    pro_info = globals.ReadProperty.init_from_config().property
    gcn_file_path = cfg['gcn_file_path'] + '/25_25_25'
    demo_path = gcn_file_path + '/demo'

    data = json.load(open(demo_path + "/ques_demo.json"))
    qkg_demo_graph_path = demo_path + '/demo_qkg'
    qkg_demo_graph_vis_path = demo_path + '/demo_visual_qkg'

    gst_demo_graph_path = demo_path + '/demo_gst'
    gst_demo_graph_vis_path = demo_path + '/demo_visual_gst'

    comgst_demo_graph_path = demo_path + '/demo_comgst'
    comgst_demo_graph_vis_path = demo_path + '/demo_visual_comgst'

    temenhance_demo_graph_vis_path = demo_path + '/demo_visual_temenhance'
    os.makedirs(temenhance_demo_graph_vis_path, exist_ok=True)

    os.makedirs(qkg_demo_graph_path, exist_ok=True)
    os.makedirs(qkg_demo_graph_vis_path, exist_ok=True)

    os.makedirs(gst_demo_graph_path, exist_ok=True)
    os.makedirs(gst_demo_graph_vis_path, exist_ok=True)

    os.makedirs(comgst_demo_graph_path, exist_ok=True)
    os.makedirs(comgst_demo_graph_vis_path, exist_ok=True)

    dataset = ['train','test','dev']
    spodatas = {}
    ques_temprank = {}
    ques_enhance = {}
    top5_answer = {}

    for ques_item in data:
        QuestionId = ques_item["Id"]
        str_QuestionId = str(QuestionId)
        QuestionText = ques_item["Question"]
        print("\n\nQuestion Id-> ", QuestionId)
        print("\n\nQuestion-> ", QuestionText)
        seed_entity = []

        #NERD entities
        for item in ques_item["Seed entity"]:
            seed_entity.append(item["qid"])

        ground_truth = get_answer(ques_item)
        path = cfg["ques_path"] + 'ques_' + str_QuestionId

        #cornerstone file including entity and predicate terminal nodes
        corner_file = path + '/cornerstone_25_new.pkl'

        #spo facts of NERD entities
        spo_file = path + '/SPO_new.txt'
        #ranking spo facts of NERD entities
        spo_rank_file = path + '/SPO_rank_new.pkl'

        # QKG networkx graph
        qkg_file = path + '/QKG_25_new.gpickle'
        # GSTs networkx graph
        unionGST_file = path + '/unionGST_25_25_new.gpickle'
        # Completed GSTs networkx graph
        completedGST_file = path + '/completedGST_25_25_new.gpickle'
        # Temporal enhanced completed GSTs networkx graph
        completeGST_tempen_file = path + '/completedGST_25_25_25_temp_new.gpickle'

        # gexf graphs
        gexf_qkggraph = qkg_demo_graph_path + '/' + str_QuestionId + '_qkg_best25.gexf'
        vis_gexf_qkggraph = qkg_demo_graph_vis_path + '/' + str_QuestionId + '_qkg_best25.gexf'

        gexf_gstgraph = gst_demo_graph_path  + '/' + str_QuestionId + '_unionGST_best25_25.gexf'
        vis_gexf_gstgraph = gst_demo_graph_vis_path + '/' + str_QuestionId + '_unionGST_best25_25.gexf'

        gexf_completegstgraph = comgst_demo_graph_path + '/' + str_QuestionId + '_completeGST_best25_25.gexf'
        vis_gexf_completegstgraph = comgst_demo_graph_vis_path + '/' + str_QuestionId + '_completeGST_best25_25.gexf'

        gexf_enhancegraph = temenhance_demo_graph_vis_path + '/' + str_QuestionId + '_temp_best25_25.gexf'

        # read terminals from the cornerstone file
        corner_nodes, corner_entities = _read_corners(corner_file)

        # generate question-relevant facts gexf graph
        QKG = nx.read_gpickle(qkg_file)
        T_qkg = get_QKGgexf_graph_xml(gexf_qkggraph, QKG, corner_nodes, corner_entities, seed_entity, ground_truth, spo_file, spo_rank_file, 'Question relevant facts')
        # add edge width size to the question-relevant facts gexf graph
        add_viz_for_qkg_gst_comp_graph(gexf_qkggraph, vis_gexf_qkggraph)
        print("\n\nQKG graph done-> ", str_QuestionId)
        print("\n\nVisualize QKG graph done-> ", str_QuestionId)

        # generate GSTs gexf graph
        GST = nx.read_gpickle(unionGST_file)
        T_gst = get_GSTgexf_graph_xml(gexf_gstgraph, GST, corner_nodes, corner_entities, seed_entity, ground_truth, QKG, 'GSTs')
        print("\n\nGST graph done-> ", str_QuestionId)
        # add edge width size to the GSTs gexf graph
        add_viz_for_qkg_gst_comp_graph(gexf_gstgraph, vis_gexf_gstgraph)
        print("\n\nVisualize GST graph done-> ", str_QuestionId)

        # generate completed GSTs gexf graph
        completedGST = nx.read_gpickle(completedGST_file)
        T_comgst = get_comgexf_nxgraph_xml(gexf_completegstgraph, completedGST, corner_nodes, corner_entities, seed_entity, ground_truth, GST,
                                      QKG, 'CompletedGSTs')
        print("\n\nCompletedGSTs graph done-> ", str_QuestionId)
        # add edge width size to the completed GSTs gexf graph
        add_viz_for_qkg_gst_comp_graph(gexf_completegstgraph, vis_gexf_completegstgraph)
        print("\n\nVisualize CompletedGSTs graph done-> ", str_QuestionId)

        # generate temporal enhanced completed GSTs gexf graph
        completeGST_tempen = nx.read_gpickle(completeGST_tempen_file)
        T_enhance = get_enhancegexf_fromcom_nxgraph_xml(gexf_enhancegraph, completeGST_tempen, GST, completedGST, corner_nodes, corner_entities, seed_entity, ground_truth,
                                              'TemporalEnhanced')
        print("\n\nTemporal enhanced completedGSTs graph done-> ", str_QuestionId)



