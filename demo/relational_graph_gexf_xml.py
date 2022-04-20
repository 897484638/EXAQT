import json
import os
import pickle
import globals
import networkx as nx
from tqdm import tqdm
import gexf
import xml.etree.ElementTree as ET

def get_relational_graph(subg_tuples):
    unique_SPO_dict = {}
    temporal_entities = []
    temporal_relations = []
    try:
        f_id = 0
        for tuples, dates in subg_tuples:
            if len(dates) > 0:
                for date_item in dates:
                    temporal_entities.append(date_item["date_id"])
                    temporal_relations.append(date_item["date_rel"])
            for sbj, rel, obj in tuples:
                n2 = rel["text"]
                n1_id = sbj["kb_id"]
                n1_name = sbj["text"]
                n3_id = obj["kb_id"]
                n3_name = obj["text"]
                if '-' in n1_id and len(n1_id.split('-')[1]) == 32:
                    n1_name = 'St-ID'
                if '-' in n3_id and len(n3_id.split('-')[1]) == 32:
                    n3_name = 'St-ID'

                if (n1_id, n2, n3_id, f_id) not in unique_SPO_dict:
                    unique_SPO_dict[(n1_id, n2, n3_id, f_id)] = {}
                unique_SPO_dict[(n1_id, n2, n3_id, f_id)]['name_n1'] = n1_name
                unique_SPO_dict[(n1_id, n2, n3_id, f_id)]['name_n3'] = n3_name
                f_id += 1
    except:
        print(len(subg_tuples))
        print(subg_tuples)

    G = nx.DiGraph()
    for (n1, n2, n3, f_id) in unique_SPO_dict:
        ent_type = ''
        if n1 not in G.nodes():
            n1_name = unique_SPO_dict[(n1, n2, n3, f_id)]['name_n1']
            if n1 in temporal_entities:
                ent_type = 'date'
            elif n1_name == 'St-ID':
                ent_type = 'St-ID'
            else:
                ent_type = 'nondate'
            G.add_node(n1, id=n1, label=n1_name, type=ent_type)
        ent_type = ''
        if n3 not in G.nodes():
            n3_name = unique_SPO_dict[(n1, n2, n3, f_id)]['name_n3']
            if n3 in temporal_entities:
                ent_type = 'date'
            elif n3_name == 'St-ID':
                ent_type = 'St-ID'
            else:
                ent_type = 'nondate'
            G.add_node(n3, id=n3, label=n3_name, type=ent_type)
        rel_type = ''
        if n2 in temporal_relations:
            rel_type = 'temporal predicate'
        else:
            rel_type = 'non-temporal predicate'
        G.add_edge(n1, n3, id=f_id, label=n2, type=rel_type, attention=0.0)

    return G

def load_dict(filename):
    word2id = dict()
    with open(filename) as f_in:
        for line in f_in:
            # word = line.strip().decode('UTF-8')
            word = line.strip()
            word2id[word] = len(word2id)
    return word2id

def get_simple_date_relgraph_xml(output_file_path, G, corner_entities, seed_entities, ground_truth, top5_answer):
    mygexf = gexf.Gexf("Zhen Jia", "Relational Graph")
    gexf_graph = mygexf.addGraph("directed", "static", "Relational Graph")
    # attributes
    type_attr = gexf_graph.addNodeAttribute(force_id='type', title='Type', type='string', defaultValue='nondate')
    corner_attr = gexf_graph.addNodeAttribute(force_id='cornerstone', title='Cornerstone', type='boolean', defaultValue='false')
    ground_attr = gexf_graph.addNodeAttribute(force_id='ground', title='GroundTruth', type='boolean', defaultValue='false')
    seed_attr = gexf_graph.addNodeAttribute(force_id='seed', title='Seed', type='boolean', defaultValue='false')
    top5_attr = gexf_graph.addNodeAttribute(force_id='top', title='Top5', type='boolean', defaultValue='false')
    rank_attr = gexf_graph.addNodeAttribute(force_id='rank', title='Rank', type='string', defaultValue='none')

    #T = nx.DiGraph()
    top5_rank = {}
    for item in top5_answer:
        if item['qid'] != '':
            top5_rank[item['qid']] = item['rank']
        else:
            top5_rank[item['label']] = item['rank']
    for n in G.nodes():
        name = G.nodes[n]['label']
        try:
            name = name.encode('utf-8').decode('unicode_escape')
        except:
            print(name)
        id = G.nodes[n]['id']
        node = gexf_graph.addNode(str(id), name)
        node.addAttribute(type_attr, G.nodes[n]['type'])
        if n in seed_entities:
            node.addAttribute(seed_attr, 'true')
        else:
            node.addAttribute(seed_attr, 'false')
        if n in corner_entities:
            node.addAttribute(corner_attr, 'true')
        else:
            node.addAttribute(corner_attr, 'false')
        if n in ground_truth:
            node.addAttribute(ground_attr, 'true')
        else:
            node.addAttribute(ground_attr, 'false')
        if n in top5_rank:
            node.addAttribute(top5_attr, 'true')
            node.addAttribute(rank_attr, str(top5_rank[n]))
        elif n.replace("T00:00:00Z","") in top5_rank:
            node.addAttribute(top5_attr, 'true')
            node.addAttribute(rank_attr, str(top5_rank[n.replace("T00:00:00Z","")]))
        else:
            node.addAttribute(top5_attr, 'false')
            node.addAttribute(rank_attr, 'none')

    att = []
    for edge in G.edges():
        data = G.get_edge_data(edge[0], edge[1])
        if float(data['attention']) not in att:
            att.append(float(data['attention']))
    att = sorted(att, reverse=True)

    for index, edge in enumerate(G.edges()):
        data = G.get_edge_data(edge[0], edge[1])
        if float(data['attention']) in att:
            rank = att.index(float(data['attention'])) + 1

        gexf_graph.addEdge(index, edge[0], edge[1], label=data['label'] + ': ' + str(rank), weight=str(data['attention']) + ": " + data['type'])
    output_file = open(output_file_path, 'wb')
    mygexf.write(output_file)
    output_file.close()


def add_XMLNS_attributes(tree, xmlns_uris_dict):
    if not ET.iselement(tree):
        tree = tree.getroot()
    for prefix, uri in xmlns_uris_dict.items():
        tree.attrib['xmlns:' + prefix] = uri

def add_viz_for_relg_rankans_graph(demo_graph, addcolor_demo_graph):
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")

    rank_first_size = 10
    rank_last_size = 1

    tree = ET.parse(demo_graph)
    root = tree.getroot()
    xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
    add_XMLNS_attributes(root, xmlns_uris)

    att = []
    for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
        weight = float(edge.attrib['weight'].split(": ")[0])
        if weight not in att:
            att.append(weight)
    att = sorted(att, reverse=True)
    max = att[0]
    min = att[len(att) - 1]

    for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            #print(edge.attrib)
        shape = ET.SubElement(edge, 'viz:shape')
        shape.set('value', 'solid')
        size = ET.SubElement(edge, 'viz:thickness')
        #color = ET.SubElement(edge, 'viz:color')
        weight = float(edge.attrib['weight'].split(": ")[0])
        #type = edge.attrib['weight'].split(": ")[1]
        if weight == 1.0:
            ed_size = 10
        else:
            ed_size = round(((rank_first_size-rank_last_size) / (max-min)) * (weight - min) + rank_last_size, 5)
        size.set('value', str(ed_size))

    tree.write(addcolor_demo_graph, encoding="utf-8", xml_declaration=True)

if __name__ == "__main__":
    # prepare data...
    print("\n\nPrepare data and start...")
    cfg = globals.get_config(globals.config_file)
    pro_info = globals.ReadProperty.init_from_config().property
    gcn_file_path = cfg['gcn_file_path'] + '/25_25_25'
    demo_path = gcn_file_path + '/demo'
    evaluate_path = gcn_file_path + '/result'
    demo_relgraph_path = demo_path + '/demo_relg'
    demo_relgraph_vis_path = demo_path + '/demo_visual_relg'
    os.makedirs(demo_relgraph_path, exist_ok=True)
    os.makedirs(demo_relgraph_vis_path, exist_ok=True)
    # prepare data...
    print("\n\nPrepare data and start...")
    pro_info = globals.ReadProperty.init_from_config().property
    ques_demo = json.load(open(demo_path + "/ques_demo.json"))
    top5_answer = {}
    seed_entities_dic = {}
    demo_data_qid = []
    for question in ques_demo:
        QuestionId = question["Id"]
        QuestionText = question["Question"]
        seed_entity = []
        for item in question["Seed entity"]:
            seed_entity.append(item["qid"])
        seed_entities_dic[QuestionId] = seed_entity
        top5_answer[QuestionId] = question["Top5 answer"]
        demo_data_qid.append(QuestionId)

    relation_file = gcn_file_path + '/relations.txt'
    entity_file = gcn_file_path + '/entities.txt'
    entity_name_map_file = gcn_file_path + '/entity_name_map.pkl'
    test_subgraph_files = gcn_file_path + '/test_subgraph.json'
    dev_subgraph_files = gcn_file_path + '/dev_subgraph.json'
    train_subgraph_files = gcn_file_path + '/train_subgraph.json'
    relation2id = load_dict(relation_file)
    entity2id = load_dict(entity_file)

    entity_name = pickle.load(open(entity_name_map_file, 'rb'))
    test_log_file = evaluate_path + '/test_exaqtlog.pkl'
    train_log_file = evaluate_path + '/train_exaqtlog.pkl'
    dev_log_file = evaluate_path + '/dev_exaqtlog.pkl'
    reverse_relation2id = {}
    for key, value in relation2id.items():
        reverse_relation2id[str(value)] = key
    #print(len(relation2id))
    reverse_entity2id = {}
    for key, value in entity2id.items():
        reverse_entity2id[str(value)] = key
    #print(reverse_entity2id['0'])

    subgraph_files = [(train_subgraph_files, train_log_file), (dev_subgraph_files, dev_log_file),
                      (test_subgraph_files, test_log_file)]
    batch_size = 1
    for item in subgraph_files:
        datas = list()
        with open(item[0], "r") as f:
            for line in tqdm(f):
                line = json.loads(line.strip())
                datas.append(line)

        logs = pickle.load(open(item[1], 'rb'))


        for data in datas:
            corner_entities = []
            answer_entities = []
            for entity in data['corner_entities']:
                corner_entities.append(entity["kb_id"])
            for entity in data['answers']:
                answer_entities.append(entity["kb_id"])

            relation_atts = []
            relations = []

            QuestionId = data["id"]
            if QuestionId not in demo_data_qid:
                continue
            QuestionText = data["question"]
            gexf_relgraph_file = demo_relgraph_path + '/' + str(QuestionId) + '_relg_best25_25.gexf'
            gexf_relgraph_vis_file = demo_relgraph_vis_path + '/' + str(QuestionId) + '_relg_best25_25.gexf'

            q_inx = datas.index(data)

            kb_fact_rels_q = {}
            RG = get_relational_graph(data['subgraph']['tuples'])
            #print("\n\n" + str(q_inx))
            iteration = q_inx // batch_size
            inx = q_inx % batch_size
            #print(logs[iteration]["start"])
            #print(logs[iteration]["end"])
            # if inx >= logs[iteration]["start"] and q < logs[iteration]["end"]:
            entity_list = logs[iteration]['local_entity'][inx].tolist()
            rel_list = logs[iteration]['rel'][inx].tolist()
            #print(len(entity_list))
            #print(len(rel_list))
            kb_fact_rels_q[inx] = {i: [] for i in range(0, len(rel_list))}
            #print("\n\n" + str(inx))
            # prnt(len(kb_fact_rels_q[q]))
            f_id = 0
            # print (len(data['subgraph']['tuples']))
            # print ('\n\n')
            for tpl, da in data['subgraph']['tuples']:
                for sbj, rel, obj in tpl:
                    kb_fact_rels_q[inx][f_id] = [sbj, rel, obj]
                    f_id += 1

            rel_att = logs[iteration]['temW_tilde'][inx].tolist()

            for i in range(0, len(entity_list)):
                name = ''
                # print (str(entity_list[0]))
                # print (reverse_entity2id[str(entity_list[0])])
                if str(entity_list[i]) in reverse_entity2id:
                    entity = reverse_entity2id[str(entity_list[i])]
                    # print(entity)
                    name = entity_name[entity]

                # print (name)

                entity_dic = {'local_id': i, 'entity_id': entity, 'entity_name': name}

                if entity_dic['local_id'] == 0: print(entity_dic)

            for i in range(0, len(rel_list)):
                rel_name = ''
                if str(rel_list[i]) in reverse_relation2id:
                    rel_name = reverse_relation2id[str(rel_list[i])]

                relation_dic = {'fact_id': i, 'fact': kb_fact_rels_q[inx][i], 'rel_id': rel_list[i], 'rel_name': rel_name,
                            'rel_att': rel_att[i]}
                relation_atts.append(relation_dic)

                for edge in RG.edges.data():
                    if edge[2]['id'] == i:
                        edge[2]['attention'] = rel_att[i]

            get_simple_date_relgraph_xml(gexf_relgraph_file, RG, corner_entities, seed_entities_dic[QuestionId], answer_entities, top5_answer[QuestionId])

            add_viz_for_relg_rankans_graph(gexf_relgraph_file, gexf_relgraph_vis_file)