import json
import codecs
import truecase
import os
import globals
import re
import CLOCQInterfaceClient as kg
import pickle
clocq = kg.CLOCQInterfaceClient(host="https://clocq.mpi-inf.mpg.de/api", port="443")

path = "/GW/qa/work/exaqt/gcn_files/25_25_25/result/"
ENT_PATTERN = re.compile('^Q[0-9]+$')

def get_question_for_show():
    test_result_file = path + "gcn_result_test_qtkg_exaqt.txt"
    dev_result_file = path + "gcn_result_dev_qtkg_exaqt.txt"
    train_result_file = path + "gcn_result_train_qtkg_exaqt.txt"
    files = [test_result_file, dev_result_file, train_result_file]
    showques = {}
    for result_file in files:
        result = open(result_file, 'r', encoding='utf-8')
        res_lines = result.readlines()

        for line in res_lines:
            if '|' in line and len(line.split('|')) > 4:
                id = line.split('|')[0]
                p1 = float(line.split('|')[1])
                hit5 = float(line.split('|')[2])
                top5 = line.split('|')[4].split(";")
                top5_ans = []
                if hit5 == 0.0:
                    continue
                rank = 0
                for item in top5:
                    if "#" not in item:
                        continue
                    ans = item.split("#")[0]
                    score = item.split("#")[1]
                    if '-' in ans and len(ans.split('-')[1]) == 32:
                        continue
                    rank += 1
                    if ENT_PATTERN.match(ans) != None:
                        label = clocq.get_label(ans)
                        # try:
                        #     label = label.encode('utf-8').decode('unicode_escape')
                        # except:
                        #     print (label)
                        url = 'http://www.wikidata.org/entity/' + ans
                        qid = ans
                        #top5_ans.append({'rank': rank, 'label': label.encode('utf-8').decode(), 'score': score, 'url': url, 'qid': qid})
                        top5_ans.append({'rank': rank, 'label': label, 'url': url, 'qid': qid})
                    else:
                        #top5_ans.append({'rank': rank, 'label': ans, 'score': score, 'url': '', 'qid': ''})
                        top5_ans.append({'rank': rank, 'label': ans, 'url': '', 'qid': ''})
                #print (top5_ans)
                if id not in showques:
                    #showques[id] = {'p1': p1, 'hit5': hit5, 'top5': top5_ans}
                    showques[id] = {'top5': top5_ans}
    return showques

def get_question_info(demoques, demoques_dir):
    json_data = open(demoques, encoding='utf-8')
    demoques_json = json.load(json_data)
    for item in demoques_json:
        id = item['Id']
        if id == 6637:
            print(item)
        demoques_front = demoques_dir + "/" + str(item['Id']) + "_ans.json"
        resultjson = codecs.open(demoques_front, "w", "utf-8")
        resultjson.write(json.dumps(item, indent=4, ensure_ascii=False))
        resultjson.close()

def get_category_question(demoques, demoques_dir, ques_demo_category_multi_file):
    json_data = open(demoques, encoding='utf-8')
    demoques_json = json.load(json_data)
    demoques_category = {}
    for item in demoques_json:
        item.pop("Answer")
        #item.pop("Data source")
        item.pop("Seed entity")
        item.pop("Top5 answer")
        item.pop("Temporal signal")
        item.pop("Data set")
        categories = sorted(item["Temporal question type"])
        item.pop("Temporal question type")
        ques_cat = ";".join(categories)
        if ";".join(categories) not in demoques_category:
            demoques_category[ques_cat] = []
        demoques_category[ques_cat].append(item)
    print (demoques_category.keys())
    resultjson = codecs.open(ques_demo_category_multi_file, "w", "utf-8")
    resultjson.write(json.dumps(demoques_category, indent=4, ensure_ascii=False))
    resultjson.close()



def get_nerd_result(wiki_ids_file, method):
    seed_entities = []
    qids = []
    qid_text = {}
    if os.path.exists(wiki_ids_file):  # line A
        with open(wiki_ids_file) as f:
            for line in f:
                if method == 'TAGME':
                    entity, score, text, label = line.strip().split('\t')
                else:
                    entity, score, text = line.strip().split('\t')
                #seed_entities.append(entity)
                label = clocq.get_label(entity)
                # try:
                #     label = label.encode('utf-8').decode('unicode_escape')
                # except:
                #     print(label)
                url = 'http://www.wikidata.org/entity/' + entity
                seed_entities.append({'label': label, 'url':url, 'qid': entity, 'text': text, 'method': method})
                qids.append(entity)
                qid_text[entity] = text
    return seed_entities, qids, qid_text

if __name__ == "__main__":
    # prepare data...
    print("\n\nPrepare data and start...")
    cfg = globals.get_config(globals.config_file)
    test = cfg["data_path"] + cfg["test_data"]
    dev = cfg["data_path"] + cfg["dev_data"]
    train = cfg["data_path"] + cfg["train_data"]
    gcn_file_path = cfg['gcn_file_path'] + '/25_25_25'
    demo_path = gcn_file_path + '/demo'
    demoques = demo_path + "/ques_demo.json"
    ques_demo_category_multi_file = demo_path + "/ques_demo_category_multi.json"
    demoques_path = demo_path + "/question"
    os.makedirs(demoques_path, exist_ok=True)
    in_files = [train, dev, test]



    showques = get_question_for_show()
    showques_results = []
    for fil in in_files:
        data = json.load(open(fil))
        for question in data:
            QuestionId = str(question["Id"])
            if QuestionId in showques:
                #dst_id = qid_map[QuestionId]
                QuestionText = question["Question"]
                QuestionText = truecase.get_true_case(QuestionText)
                question.update({"Question truecase": QuestionText + '?'})
                print("\n\nQuestion Id-> ", QuestionId)
                print("\n\nQuestion-> ", QuestionText)
                path = cfg["ques_path"] + 'ques_' + str(QuestionId)
                elq_wiki_ids_file = path + '/wiki_ids_elq.txt'
                tagme_wiki_ids_file = path + '/wiki_ids_tagme_new.txt'
                #seeds = []
                # [Detected by ELQ]
                elq_seed_entities, elq_qids, elq_qid_text = get_nerd_result(elq_wiki_ids_file, 'ELQ')
                # [Detected by TAGME]
                tagme_seed_entities, tagme_qids, tagme_qid_text = get_nerd_result(tagme_wiki_ids_file, 'TAGME')
                both_qids = [i for i in elq_qids if i in tagme_qids]
                seed_entities = []
                # [Detected by ELQ and TAGME]
                for item in elq_seed_entities:
                    if item['qid'] in both_qids and item['text'] == tagme_qid_text[item['qid']]:
                        item['method'] = 'ELQ and TAGME'
                    if item not in seed_entities:
                        seed_entities.append(item)
                for item in tagme_seed_entities:
                    if item['qid'] in both_qids and item['text'] == elq_qid_text[item['qid']]:
                        item['method'] = 'ELQ and TAGME'
                    if item not in seed_entities:
                        seed_entities.append(item)
                        #seed_entities.remove(seed_entities[seed_entities.index(item)])


                question.update({"Seed entity": seed_entities})
                question.update({"Top5 answer": showques[QuestionId]['top5']})
                #question.update({"Hit@5": showques[QuestionId]['hit5']})
                #question.update({"P@1": showques[QuestionId]['p1']})
                #question.update({"TimeQuestions qid": dst_id})
                del question['Data source']
                del question['Question creation date']
                showques_results.append(question)
    showques_results = sorted(showques_results, key=lambda e: (e.__getitem__('Id')), reverse=False)
    ques_json = codecs.open(demoques, "w", "utf-8")
    ques_json.write(json.dumps(showques_results, ensure_ascii=False, indent=4))
    ques_json.close()

    #get_category_question(demoques, demoques_path, ques_demo_category_multi_file)
    get_question_info(demoques, demoques_path)