import json
import os
import requests
from pathlib import Path
import shutil
import string
import random

class PyObfuscator:
    def obfuscate(self, lines):
        response = requests.post("https://obfuscator.io/obfuscate", json=
            {
                "code": lines, 
                "options": {
                    "compact": True,
                    "controlFlowFlattening": False,
                    "controlFlowFlatteningThreshold": 0,
                    "deadCodeInjection": False,
                    "deadCodeInjectionThreshold": 0,
                    "debugProtection": True,
                    "debugProtectionInterval": True,
                    "disableConsoleOutput": True,
                    "domainLock": [],
                    "identifierNamesGenerator": "hexadecimal",
                    "identifiersPrefix": "",
                    "renameGlobals": False,
                    "reservedNames": ['runAll'],
                    "reservedStrings": [],
                    "rotateStringArray": True,
                    "rotateStringArrayEnabled": True,
                    "seed": 0,
                    "selfDefending": True,
                    "sourceMap": False,
                    "sourceMapBaseUrl": "",
                    "sourceMapFileName": "",
                    "sourceMapSeparate": False,
                    "stringArray": True,
                    "stringArrayEncoding": ["none"],
                    "stringArrayEncodingEnabled": True,
                    "stringArrayThreshold": 0.8,
                    "stringArrayThresholdEnabled": True,
                    "target": "browser",
                    "transformObjectKeys": True,
                    "unicodeEscapeSequence": True
                }
            }
        )
        
        return response.json()["code"]

files=os.listdir('.')
output = 'dist'

os.mkdir(output)
for file in files:
    if not '.git' in file and not 'dist' in file and not 'builder' in file:

        if file.endswith(".js"):
            with open(file, 'r') as f:
                lines = f.read()
                lines = lines.split('//linesplit')
                print(len(lines))
                final = ''
                functionInject = False
                for line in lines:
                    if('function runAll(){' in line):
                        line = line.strip().replace('function runAll(){', '')
                        line = line[:-1]
                        obfuscated = PyObfuscator().obfuscate(line)
                        functionInject = obfuscated

                    else:
                            
                        obfuscated = PyObfuscator().obfuscate(line)
                        final += obfuscated + '\n'
                if functionInject:
                    print('Injecting Function')
                    final = final.replace('runAll',"()=>{" + functionInject + "}")

                with open(os.path.join(output, file), 'w') as f:
                    f.write(final)
                print('Obfuscated '+ file)
        else:
            if('.'in file):
                shutil.copy(file, output)
            else:
                shutil.copytree(file, os.path.join('.', output,file)) 
            print('Coppied ' + file)


    
    # if file.endswith('.js'):
    #     with open(file, 'r') as f:
    #         lines = f.readlines()
    #         obfuscated = PyObfuscator().obfuscate(lines)
    #         with open(file, 'w') as f:
    #             f.writelines(obfuscated)



# with open('content.js','r') as f:
#     print(PyObfuscator().obfuscate(f.read()))