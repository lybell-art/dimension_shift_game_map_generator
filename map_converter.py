directory = input("경로를 입력하세요.")
try:
    f = open(directory, 'r')
except FileNotFoundError:
    print("File Not Founded")
else:
    data = f.read()
    f.close()
    data2 = data.replace(',\n        ', ',')
    data2 = data2.replace('[\n        ', '[')
    data2 = data2.replace('\n      ]', ']')


    f2 = open(directory, 'w')
    f2.write(data2)
    f2.close()

    print("Successfully converted")
