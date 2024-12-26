import React, { useState } from 'react';
import classesData from './classes.json';

const PythonCodeGenerator = () => {
    const [generatedCode, setGeneratedCode] = useState('');

    const generatePythonCode = () => {
        let pythonCode = '';

        // Track inheritance relationships
        const inheritanceMap = {};
        
        // Process inheritance relationships
        if (classesData.relationships) {
            classesData.relationships.forEach(rel => {
                if (rel.type === 'generalization') {
                    const sourceClass = classesData.classes.find(c => c.key === rel.from);
                    const targetClass = classesData.classes.find(c => c.key === rel.to);
                    
                    if (sourceClass && targetClass) {
                        inheritanceMap[sourceClass.name] = targetClass.name;
                    }
                }
            });
        }

        // Add imports
        pythonCode += 'from typing import List, Optional\n\n';

        // Generate Python classes
        classesData.classes.forEach(classInfo => {
            // Class definition with potential inheritance
            let classDefinition = `class ${classInfo.name}`;
            if (inheritanceMap[classInfo.name]) {
                classDefinition += `(${inheritanceMap[classInfo.name]})`;
            }
            classDefinition += ':\n';
            pythonCode += classDefinition;

            // Class docstring
            pythonCode += '    """';
            pythonCode += `\n    ${classInfo.name} class`;
            if (inheritanceMap[classInfo.name]) {
                pythonCode += ` inheriting from ${inheritanceMap[classInfo.name]}`;
            }
            pythonCode += '\n    """\n\n';

            // Generate constructor
            pythonCode += '    def __init__(self';
            // Add constructor parameters for properties
            classInfo.properties.forEach(prop => {
                const pythonType = convertToPythonType(prop.type);
                pythonCode += `, ${prop.name}: ${pythonType} = None`;
            });
            pythonCode += '):\n';
            
            // Call parent constructor if inheriting
            if (inheritanceMap[classInfo.name]) {
                pythonCode += '        super().__init__()\n';
            }

            // Initialize properties
            classInfo.properties.forEach(prop => {
                pythonCode += `        self.${prop.name} = ${prop.name}\n`;
            });
            pythonCode += '\n';

            // Generate methods
            classInfo.methods.forEach(method => {
                const returnType = convertToPythonType(method.type);
                const paramString = method.parameters.map(param =>
                    `${param.name}: ${convertToPythonType(param.type)}`
                ).join(', ');

                pythonCode += `    def ${method.name}(self${paramString ? ', ' + paramString : ''}) -> ${returnType}:\n`;
                pythonCode += '        """';
                pythonCode += `\n        ${method.name} method`;
                if (method.parameters.length > 0) {
                    pythonCode += '\n\n        Args:\n';
                    method.parameters.forEach(param => {
                        pythonCode += `            ${param.name}: ${param.type} parameter\n`;
                    });
                }
                pythonCode += `\n        Returns:\n            ${returnType}\n`;
                pythonCode += '        """\n';
                pythonCode += '        # TODO: Implement method\n';
                if (method.type !== 'void') {
                    pythonCode += '        return None  # Placeholder return\n';
                }
                pythonCode += '\n';
            });

            // Add string representation
            pythonCode += '    def __str__(self) -> str:\n';
            pythonCode += `        return f"${classInfo.name}(${
                classInfo.properties.map(p => `${p.name}={self.${p.name}}`).join(', ')
            })"\n\n`;
        });

        // Add relationships as comments
        pythonCode += '# Relationships:\n';
        if (classesData.relationships) {
            classesData.relationships.forEach(rel => {
                const sourceClass = classesData.classes.find(c => c.key === rel.from);
                const targetClass = classesData.classes.find(c => c.key === rel.to);

                if (sourceClass && targetClass) {
                    pythonCode += `# ${sourceClass.name} ${rel.type} ${targetClass.name}`;
                    if (rel.multiplicity) {
                        pythonCode += ` (Multiplicity: ${rel.multiplicity})`;
                    }
                    pythonCode += '\n';
                }
            });
        }

        setGeneratedCode(pythonCode);
    };

    const convertToPythonType = (javaType) => {
        switch (javaType?.toLowerCase()) {
            case 'string':
                return 'str';
            case 'int':
                return 'int';
            case 'double':
            case 'float':
                return 'float';
            case 'boolean':
                return 'bool';
            case 'void':
                return 'None';
            default:
                return 'Any';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode)
            .then(() => alert('Python code copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    };

    return (
        <div className="python-code-generator">
            <button 
                onClick={generatePythonCode}
                className="menu-btn"
            >
                Generate Python Code
            </button>
            {generatedCode && (
                <div className="generated-code-section">
                    <button
                        onClick={copyToClipboard}
                        className="menu-btn copy-btn"
                    >
                        Copy Code
                    </button>
                    <pre className="generated-code">
                        {generatedCode}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default PythonCodeGenerator;