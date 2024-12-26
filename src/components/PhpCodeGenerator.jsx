import React, { useState } from 'react';
import classesData from './classes.json';

const PhpCodeGenerator = () => {
    const [generatedCode, setGeneratedCode] = useState('');

    const generatePhpCode = () => {
        let phpCode = "<?php\n\n";

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

        // Generate PHP classes
        classesData.classes.forEach(classInfo => {
            // Add class documentation
            phpCode += "/**\n";
            phpCode += ` * Class ${classInfo.name}\n`;
            if (inheritanceMap[classInfo.name]) {
                phpCode += ` * @extends ${inheritanceMap[classInfo.name]}\n`;
            }
            phpCode += " */\n";

            // Class definition with potential inheritance
            let classDefinition = `class ${classInfo.name}`;
            if (inheritanceMap[classInfo.name]) {
                classDefinition += ` extends ${inheritanceMap[classInfo.name]}`;
            }
            classDefinition += " {\n";
            phpCode += classDefinition;

            // Generate properties
            classInfo.properties.forEach(prop => {
                const visibility = prop.visibility === 'private' ? 'private' :
                                 prop.visibility === 'public' ? 'public' :
                                 prop.visibility === 'protected' ? 'protected' : 'private';
                
                phpCode += `    /** @var ${convertToPhpType(prop.type)} */\n`;
                phpCode += `    ${visibility} $${prop.name};\n\n`;
            });

            // Generate constructor
            phpCode += "    /**\n";
            phpCode += "     * Constructor\n";
            classInfo.properties.forEach(prop => {
                phpCode += `     * @param ${convertToPhpType(prop.type)} $${prop.name}\n`;
            });
            phpCode += "     */\n";
            phpCode += "    public function __construct(";
            phpCode += classInfo.properties
                .map(prop => `${convertToPhpType(prop.type)} $${prop.name} = null`)
                .join(', ');
            phpCode += ") {\n";
            if (inheritanceMap[classInfo.name]) {
                phpCode += "        parent::__construct();\n";
            }
            classInfo.properties.forEach(prop => {
                phpCode += `        $this->${prop.name} = $${prop.name};\n`;
            });
            phpCode += "    }\n\n";

            // Generate getters and setters
            classInfo.properties.forEach(prop => {
                const capitalizedName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
                const phpType = convertToPhpType(prop.type);

                // Getter
                phpCode += `    /**\n`;
                phpCode += `     * Get ${prop.name}\n`;
                phpCode += `     * @return ${phpType}\n`;
                phpCode += `     */\n`;
                phpCode += `    public function get${capitalizedName}(): ${phpType}\n`;
                phpCode += `    {\n`;
                phpCode += `        return $this->${prop.name};\n`;
                phpCode += `    }\n\n`;

                // Setter
                phpCode += `    /**\n`;
                phpCode += `     * Set ${prop.name}\n`;
                phpCode += `     * @param ${phpType} $${prop.name}\n`;
                phpCode += `     * @return self\n`;
                phpCode += `     */\n`;
                phpCode += `    public function set${capitalizedName}(${phpType} $${prop.name}): self\n`;
                phpCode += `    {\n`;
                phpCode += `        $this->${prop.name} = $${prop.name};\n`;
                phpCode += `        return $this;\n`;
                phpCode += `    }\n\n`;
            });

            // Generate methods
            classInfo.methods.forEach(method => {
                const visibility = method.visibility === 'private' ? 'private' :
                                 method.visibility === 'public' ? 'public' :
                                 method.visibility === 'protected' ? 'protected' : 'public';
                
                const returnType = convertToPhpType(method.type);
                const paramString = method.parameters
                    .map(param => `${convertToPhpType(param.type)} $${param.name}`)
                    .join(', ');

                phpCode += `    /**\n`;
                phpCode += `     * ${method.name} method\n`;
                method.parameters.forEach(param => {
                    phpCode += `     * @param ${convertToPhpType(param.type)} $${param.name}\n`;
                });
                phpCode += `     * @return ${returnType}\n`;
                phpCode += `     */\n`;
                phpCode += `    ${visibility} function ${method.name}(${paramString}): ${returnType}\n`;
                phpCode += `    {\n`;
                phpCode += `        // TODO: Implement method\n`;
                if (method.type !== 'void') {
                    phpCode += `        return null; // Placeholder return\n`;
                }
                phpCode += `    }\n\n`;
            });

            // End of class
            phpCode += "}\n\n";
        });

        // Add relationships as comments
        phpCode += "// Relationships:\n";
        if (classesData.relationships) {
            classesData.relationships.forEach(rel => {
                const sourceClass = classesData.classes.find(c => c.key === rel.from);
                const targetClass = classesData.classes.find(c => c.key === rel.to);

                if (sourceClass && targetClass) {
                    phpCode += `// ${sourceClass.name} ${rel.type} ${targetClass.name}`;
                    if (rel.multiplicity) {
                        phpCode += ` (Multiplicity: ${rel.multiplicity})`;
                    }
                    phpCode += "\n";
                }
            });
        }

        setGeneratedCode(phpCode);
    };

    const convertToPhpType = (javaType) => {
        switch (javaType?.toLowerCase()) {
            case 'string':
                return 'string';
            case 'int':
                return 'int';
            case 'double':
            case 'float':
                return 'float';
            case 'boolean':
                return 'bool';
            case 'void':
                return 'void';
            default:
                return 'mixed';
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode)
            .then(() => alert('PHP code copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    };

    return (
        <div className="php-code-generator">
            <button 
                onClick={generatePhpCode}
                className="menu-btn"
            >
                Generate PHP Code
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

export default PhpCodeGenerator;