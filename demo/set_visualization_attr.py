import xml.etree.ElementTree as ET
import os

def add_XMLNS_attributes(tree, xmlns_uris_dict):
    if not ET.iselement(tree):
        tree = tree.getroot()
    for prefix, uri in xmlns_uris_dict.items():
        tree.attrib['xmlns:' + prefix] = uri

def add_viz_for_relg_rankans_graph():
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_relg_v6\\'

    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_relg_rank\\'

    os.makedirs(addcolor_demo_graph_path, exist_ok=True)
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")

    list_dir = os.listdir(demo_graph_path)
    rank_first_size = 10
    rank_last_size = 1
    print(list_dir)
    for file in list_dir:
        tree = ET.parse(demo_graph_path + file)
        root = tree.getroot()
        xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
        add_XMLNS_attributes(root, xmlns_uris)

        # color
        #temedge_color = ['255', '127', '80']
        #nontemedge_color = ['39', '27', '18']

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
            # if type == "temporal predicate":
            #     color.set('r', temedge_color[0])
            #     color.set('g', temedge_color[1])
            #     color.set('b', temedge_color[2])
            # else:
            #     color.set('r', nontemedge_color[0])
            #     color.set('g', nontemedge_color[1])
            #     color.set('b', nontemedge_color[2])

        tree.write(addcolor_demo_graph_path + file, encoding="utf-8", xml_declaration=True)

def add_viz_for_relg_graph():
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_relg_v6\\'

    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_relg_rank\\'

    os.makedirs(addcolor_demo_graph_path, exist_ok=True)
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")

    list_dir = os.listdir(demo_graph_path)
    print(list_dir)
    for file in list_dir:
        tree = ET.parse(demo_graph_path + file)
        root = tree.getroot()
        xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
        add_XMLNS_attributes(root, xmlns_uris)

        # color
        # gst_color = ['248', '165', '76']
        # com_color = ['255', '214', '153']
        # enh_color = ['153', '223', '249']
        # seed_color = ['211', '89', '35']
        # corner_color = ['211', '124', '35']
        # ground_color = ['127', '232', '116']
        # cvt_color = ['128', '126', '122']

        gst_color = ['255', '192', '0']
        com_color = ['255', '230', '153']
        enh_color = ['153', '223', '249']
        seed_color = ['211', '124', '35']
        corner_color = ['211', '124', '35']
        ground_color = ['101', '185', '92']
        cvt_color = ['128', '126', '122']

        # size
        cvt_size = '4.0'
        corner_size = '90'
        top5_rank1_size = '80.600006'
        top5_rank2_size = '70.37143'
        top5_rank3_size = '55.142853'
        top5_rank4_size = '50.91429'
        top5_rank5_size = '40.428574'
        # 28.685715
        other_node_size = '30.457146'

        for node in root.iter('{http://www.gephi.org/gexf/1.2draft}node'):
            #print(node.attrib)
            color = ET.SubElement(node, 'viz:color')
            size = ET.SubElement(node, 'viz:size')
            size.set('value', other_node_size)
            seed_flag = 0
            for attr in node.iter('{http://www.gephi.org/gexf/1.2draft}attvalue'):
                node_attr = attr.attrib
                if node_attr['for'] == 'method':
                    if node_attr['value'] == 'TemporalEnhanced':
                        color.set('r', enh_color[0])
                        color.set('g', enh_color[1])
                        color.set('b', enh_color[2])
                    elif node_attr['value'] == 'GSTs':
                        color.set('r', gst_color[0])
                        color.set('g', gst_color[1])
                        color.set('b', gst_color[2])
                    elif node_attr['value'] == 'CompletedGSTs':
                        color.set('r', com_color[0])
                        color.set('g', com_color[1])
                        color.set('b', com_color[2])
                    elif node_attr['value'] == 'St-ID':
                        color.set('r', cvt_color[0])
                        color.set('g', cvt_color[1])
                        color.set('b', cvt_color[2])
                        size.set('value', cvt_size)
                if node_attr['for'] == 'cornerstone' and node_attr['value'] == 'true':
                    color.set('r', corner_color[0])
                    color.set('g', corner_color[1])
                    color.set('b', corner_color[2])
                    size.set('value', corner_size)
                    # shape.set('value', 'disc')
                if node_attr['for'] == 'seed' and node_attr['value'] == 'true':
                    seed_flag = 1
                    color.set('r', seed_color[0])
                    color.set('g', seed_color[1])
                    color.set('b', seed_color[2])
                    size.set('value', corner_size)
                if node_attr['for'] == 'ground' and node_attr['value'] == 'true':
                    color.set('r', ground_color[0])
                    color.set('g', ground_color[1])
                    color.set('b', ground_color[2])
                if seed_flag == 0 and node_attr['for'] == 'rank' and node_attr['value'] == '1':
                    size.set('value', top5_rank1_size)
                if seed_flag == 0 and node_attr['for'] == 'rank' and node_attr['value'] == '2':
                    size.set('value', top5_rank2_size)
                if seed_flag == 0 and node_attr['for'] == 'rank' and node_attr['value'] == '3':
                    size.set('value', top5_rank3_size)
                if seed_flag == 0 and node_attr['for'] == 'rank' and node_attr['value'] == '4':
                    size.set('value', top5_rank4_size)
                if seed_flag == 0 and node_attr['for'] != 'rank' and node_attr['value'] == '5':
                    size.set('value', top5_rank5_size)

        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            #print(edge.attrib)
            shape = ET.SubElement(edge, 'viz:shape')
            shape.set('value', 'solid')
            size = ET.SubElement(edge, 'viz:thickness')
            #size.set('value', '1')
            ranks = edge.attrib['label'].split(': ')
            print (ranks)
            if int(ranks[len(ranks)-1]) == 1:
                size.set('value', '5')
            elif int(ranks[len(ranks) - 1]) == 2:
                size.set('value', '3')
            elif int(ranks[len(ranks) - 1]) >= 3 and int(ranks[len(ranks) - 1]) <= 10:
                size.set('value', '2')
            else:
                size.set('value', '1')

        tree.write(addcolor_demo_graph_path + file, encoding="utf-8", xml_declaration=True)

def add_viz_for_qkg_graph():
    #demo_graph_path = 'C:\\QA\DEMO\\EXAQT\\EXAQT第五版\\index\\demo_visual_v3\\'
    #addcolor_demo_graph_path = 'C:\\QA\DEMO\\EXAQT\\EXAQT第五版\\index\\demo_visual_v7\\'

    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_v4\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_qkg\\'

    os.makedirs(addcolor_demo_graph_path, exist_ok=True)
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")
    rank_first_size = 10
    rank_last_size = 1
    list_dir = os.listdir(demo_graph_path)
    for file in list_dir:
        if "qkg_best25" not in file:
            continue
        tree = ET.parse(demo_graph_path + file)
        root = tree.getroot()
        xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
        add_XMLNS_attributes(root, xmlns_uris)

        # color
        connect_color = ['70', '130', '180']
        qkg_color = ['255', '214', '153']

        seed_color = ['211', '89', '35']
        corner_color = ['211', '124', '35']
        ground_color = ['127', '232', '116']

        # shape
        entity_node_shape = 'disc'
        predicate_node_shape = 'triangle'

        # size
        seed_size = '60'
        corner_size = '40'
        noncorner_size = '40'

        #predicatecorner_size = '60'
        #predicatenoncorner_size = '40'


        # for node in root.iter('{http://www.gephi.org/gexf/1.2draft}node'):
        #     #print(node.attrib)
        #     #print (node.attrib['id'])
        #     color = ET.SubElement(node, 'viz:color')
        #     shape = ET.SubElement(node, 'viz:shape')
        #     size = ET.SubElement(node, 'viz:size')
        #     if '::Predicate::' in node.attrib['id']:
        #         shape.set('value', predicate_node_shape)
        #     else:
        #         shape.set('value', entity_node_shape)
        #     size.set('value', noncorner_size)
        #     for attr in node.iter('{http://www.gephi.org/gexf/1.2draft}attvalue'):
        #         node_attr = attr.attrib
        #         if node_attr['for'] == 'method':
        #             if node_attr['value'] == "Injecting connectivity":
        #                 color.set('r', connect_color[0])
        #                 color.set('g', connect_color[1])
        #                 color.set('b', connect_color[2])
        #             else:
        #                 color.set('r', qkg_color[0])
        #                 color.set('g', qkg_color[1])
        #                 color.set('b', qkg_color[2])
        #         if node_attr['for'] == 'cornerstone' and node_attr['value'] == 'true':
        #             color.set('r', corner_color[0])
        #             color.set('g', corner_color[1])
        #             color.set('b', corner_color[2])
        #             size.set('value', corner_size)
        #         if node_attr['for'] == 'seed' and node_attr['value'] == 'true':
        #             color.set('r', seed_color[0])
        #             color.set('g', seed_color[1])
        #             color.set('b', seed_color[2])
        #             size.set('value', seed_size)
        #         if node_attr['for'] == 'ground' and node_attr['value'] == 'true':
        #             color.set('r', ground_color[0])
        #             color.set('g', ground_color[1])
        #             color.set('b', ground_color[2])

        # for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
        #     edge.attrib.update({'weight': '5'})
        #     print(edge.attrib)
        wei = []
        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            weight = float(edge.attrib['weight'])
            if weight not in wei:
                wei.append(weight)
        wei = sorted(wei, reverse=True)
        max = wei[0]
        min = wei[len(wei) - 1]

        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            #print(edge.attrib)
            shape = ET.SubElement(edge, 'viz:shape')
            shape.set('value', 'solid')
            size = ET.SubElement(edge, 'viz:thickness')
            #size.set('value', '1')
            rank = edge.attrib['label']
            weight = float(edge.attrib['weight'])
            # type = edge.attrib['weight'].split(": ")[1]
            if weight == 1.0:
                ed_size = 10
            else:
                ed_size = round(((rank_first_size - rank_last_size) / (max - min)) * (weight - min) + rank_last_size, 5)
            size.set('value', str(ed_size))

            # if int(rank) == 1:
            #     size.set('value', '10')
            # elif int(rank) == 2:
            #     size.set('value', '8')
            # elif int(rank) == 3:
            #     size.set('value', '6')
            # elif int(rank) == 4:
            #     size.set('value', '4')
            # elif int(rank) == 5:
            #     size.set('value', '3')
            # elif int(rank) >= 6 and int(rank) <= 10:
            #     size.set('value', '2')
            # else:
            #     size.set('value', '1')

        tree.write(addcolor_demo_graph_path + file, encoding="utf-8", xml_declaration=True)

def add_viz_for_gst_graph():
    #demo_graph_path = 'C:\\QA\DEMO\\EXAQT\\EXAQT第五版\\index\\demo_visual_v3\\'
    #addcolor_demo_graph_path = 'C:\\QA\DEMO\\EXAQT\\EXAQT第五版\\index\\demo_visual_v7\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_v4\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_gst\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_withouthang\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_gst_nohang\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_gst_comgst_graph\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_gst_original\\'
    os.makedirs(addcolor_demo_graph_path, exist_ok=True)
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")

    list_dir = os.listdir(demo_graph_path)
    #print(list_dir)
    for file in list_dir:
        if "unionGST_best25_25" not in file:
            continue
        tree = ET.parse(demo_graph_path + file)
        root = tree.getroot()
        xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
        add_XMLNS_attributes(root, xmlns_uris)

        # color
        gst_color = ['248', '165', '76']
        com_color = ['255', '214', '153']
        enh_color = ['153', '223', '249']
        seed_color = ['211', '89', '35']
        corner_color = ['211', '124', '35']
        ground_color = ['127', '232', '116']

        # shape
        entity_node_shape = 'disc'
        predicate_node_shape = 'triangle'

        # size
        seed_size = '60'
        corner_size = '40'
        noncorner_size = '40'

        #predicatecorner_size = '60'
        #predicatenoncorner_size = '40'


        # for node in root.iter('{http://www.gephi.org/gexf/1.2draft}node'):
        #     #print(node.attrib)
        #     #print (node.attrib['id'])
        #     color = ET.SubElement(node, 'viz:color')
        #     shape = ET.SubElement(node, 'viz:shape')
        #     size = ET.SubElement(node, 'viz:size')
        #     if '::Predicate::' in node.attrib['id']:
        #         shape.set('value', predicate_node_shape)
        #     else:
        #         shape.set('value', entity_node_shape)
        #     size.set('value', noncorner_size)
        #     for attr in node.iter('{http://www.gephi.org/gexf/1.2draft}attvalue'):
        #
        #         node_attr = attr.attrib
        #         if node_attr['for'] == 'method':
        #             if node_attr['value'] == 'TemporalEnhance':
        #                 color.set('r', enh_color[0])
        #                 color.set('g', enh_color[1])
        #                 color.set('b', enh_color[2])
        #             elif node_attr['value'] == 'GSTs':
        #                 color.set('r', gst_color[0])
        #                 color.set('g', gst_color[1])
        #                 color.set('b', gst_color[2])
        #             elif node_attr['value'] == 'CompleteGSTs':
        #                 color.set('r', com_color[0])
        #                 color.set('g', com_color[1])
        #                 color.set('b', com_color[2])
        #         if node_attr['for'] == 'cornerstone' and node_attr['value'] == 'true':
        #             color.set('r', corner_color[0])
        #             color.set('g', corner_color[1])
        #             color.set('b', corner_color[2])
        #             size.set('value', corner_size)
        #         if node_attr['for'] == 'seed' and node_attr['value'] == 'true':
        #             color.set('r', seed_color[0])
        #             color.set('g', seed_color[1])
        #             color.set('b', seed_color[2])
        #             size.set('value', seed_size)
        #         if node_attr['for'] == 'ground' and node_attr['value'] == 'true':
        #             color.set('r', ground_color[0])
        #             color.set('g', ground_color[1])
        #             color.set('b', ground_color[2])

        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            # print(edge.attrib)
            shape = ET.SubElement(edge, 'viz:shape')
            shape.set('value', 'solid')
            size = ET.SubElement(edge, 'viz:thickness')
            # size.set('value', '1')
            try:
                rank = edge.attrib['label']
            except:
                print (file)
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

        tree.write(addcolor_demo_graph_path + file, encoding="utf-8", xml_declaration=True)

def add_viz_for_comgst_enhance_graph():
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_v4\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_temenhance\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_withouthang\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_comgst_nohang\\'
    #demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_gst_comgst_graph\\'
    #addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_comgst_graph\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_temenhance_gexf\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_temenhance\\'
    demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_temenhance_fromcompletedgst\\'
    addcolor_demo_graph_path = 'C:\\Users\\zhenj\\PycharmProjects\\exaqt_demo\\static\graph\\demo_visual_temenhance_v2\\'
    os.makedirs(addcolor_demo_graph_path, exist_ok=True)
    ET.register_namespace("", "http://www.gephi.org/gexf/1.2draft")

    list_dir = os.listdir(demo_graph_path)
    #print(list_dir)
    for file in list_dir:
        #if "completeGST_best25_25" not in file:
        #    continue
        if "temp_best25_25" not in file:
            continue
        tree = ET.parse(demo_graph_path + file)
        root = tree.getroot()
        xmlns_uris = {'viz': 'http://www.gexf.net/1.2draft/viz'}
        add_XMLNS_attributes(root, xmlns_uris)

        # color
        gst_color = ['248', '165', '76']
        com_color = ['255', '214', '153']
        enh_color = ['153', '223', '249']
        seed_color = ['211', '89', '35']
        corner_color = ['211', '124', '35']
        ground_color = ['127', '232', '116']

        # shape
        entity_node_shape = 'disc'
        predicate_node_shape = 'triangle'

        # size
        seed_size = '60'
        corner_size = '40'
        noncorner_size = '40'

        #predicatecorner_size = '60'
        #predicatenoncorner_size = '40'


        # for node in root.iter('{http://www.gephi.org/gexf/1.2draft}node'):
        #     #print(node.attrib)
        #     #print (node.attrib['id'])
        #     color = ET.SubElement(node, 'viz:color')
        #     shape = ET.SubElement(node, 'viz:shape')
        #     size = ET.SubElement(node, 'viz:size')
        #     if '::Predicate::' in node.attrib['id']:
        #         shape.set('value', predicate_node_shape)
        #     else:
        #         shape.set('value', entity_node_shape)
        #     size.set('value', noncorner_size)
        #     for attr in node.iter('{http://www.gephi.org/gexf/1.2draft}attvalue'):
        #
        #         node_attr = attr.attrib
        #         if node_attr['for'] == 'method':
        #             if node_attr['value'] == 'TemporalEnhance':
        #                 color.set('r', enh_color[0])
        #                 color.set('g', enh_color[1])
        #                 color.set('b', enh_color[2])
        #             elif node_attr['value'] == 'GSTs':
        #                 color.set('r', gst_color[0])
        #                 color.set('g', gst_color[1])
        #                 color.set('b', gst_color[2])
        #             elif node_attr['value'] == 'CompleteGSTs':
        #                 color.set('r', com_color[0])
        #                 color.set('g', com_color[1])
        #                 color.set('b', com_color[2])
        #         if node_attr['for'] == 'cornerstone' and node_attr['value'] == 'true':
        #             color.set('r', corner_color[0])
        #             color.set('g', corner_color[1])
        #             color.set('b', corner_color[2])
        #             size.set('value', corner_size)
        #         if node_attr['for'] == 'seed' and node_attr['value'] == 'true':
        #             color.set('r', seed_color[0])
        #             color.set('g', seed_color[1])
        #             color.set('b', seed_color[2])
        #             size.set('value', seed_size)
        #         if node_attr['for'] == 'ground' and node_attr['value'] == 'true':
        #             color.set('r', ground_color[0])
        #             color.set('g', ground_color[1])
        #             color.set('b', ground_color[2])

        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            # print(edge.attrib)
            shape = ET.SubElement(edge, 'viz:shape')
            shape.set('value', 'solid')
            size = ET.SubElement(edge, 'viz:thickness')
            # size.set('value', '1')
            try:
                rank = edge.attrib['label']
            except:
                print (file)
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

        for edge in root.iter('{http://www.gephi.org/gexf/1.2draft}edge'):
            # print(edge.attrib)
            shape = ET.SubElement(edge, 'viz:shape')
            shape.set('value', 'solid')
            size = ET.SubElement(edge, 'viz:thickness')
            size.set('value', '1')

        tree.write(addcolor_demo_graph_path + file, encoding="utf-8", xml_declaration=True)

#add_viz_for_gst_graph()
#add_viz_for_relg_graph()
#add_viz_for_qkg_graph()
add_viz_for_comgst_enhance_graph()
#add_viz_for_relg_rankans_graph()