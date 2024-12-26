import React, { useState } from 'react';
import classesData from './classes.json';

const JavaCodeGenerator = () => {
    const [generatedCode, setGeneratedCode] = useState('');

    // Helper function to capitalize first letter
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Generate getter method for a property
    const generateGetter = (prop) => {
        const methodName = `get${capitalize(prop.name)}`;
        return `    public ${prop.type} ${methodName}() {
        return this.${prop.name};
    }\n\n`;
    };

    // Generate setter method for a property
    const generateSetter = (prop) => {
        const methodName = `set${capitalize(prop.name)}`;
        return `    public void ${methodName}(${prop.type} ${prop.name}) {
        this.${prop.name} = ${prop.name};
    }\n\n`;
    };

    const generateJavaCode = () => {
        let javaCode = '';
        
        // Track inheritance relationships
        const inheritanceMap = {};
        
        // First, process inheritance relationships
        if (classesData.relationships) {
            classesData.relationships.forEach(rel => {
                if (rel.type === 'generalization') {
                    const sourceClass = classesData.classes.find(c => c.key === rel.from);
                    const targetClass = classesData.classes.find(c => c.key === rel.to);
                    
                    if (sourceClass && targetClass) {
                        inheritanceMap[targetClass.name] = sourceClass.name;
                    }
                }
            });
        }

        // Generate Java classes with inheritance
        classesData.classes.forEach(classInfo => {
            // Check if this class is a child class
            const parentClass = Object.keys(inheritanceMap).find(key => inheritanceMap[key] === classInfo.name);
            
            // Start of class definition with potential inheritance
            let classDefinition = `public class ${classInfo.name}`;
            if (parentClass) {
                classDefinition += ` extends ${parentClass}`;
            }
            classDefinition += ' {\n';
            javaCode += classDefinition;

            // Generate properties (fields)
            classInfo.properties.forEach(prop => {
                const visibility = prop.visibility === 'private' ? 'private' :
                                   prop.visibility === 'public' ? 'public' :
                                   prop.visibility === 'protected' ? 'protected' : 'private'; // Default to private
                javaCode += `    ${visibility} ${prop.type} ${prop.name};\n`;
            });

            // Add a blank line after properties
            javaCode += '\n';

            // Generate constructor
            javaCode += `    // Constructor\n`;
            javaCode += `    public ${classInfo.name}() {\n`;
            if (parentClass) {
                javaCode += `        super(); // Call parent class constructor\n`;
            }
            javaCode += `    }\n\n`;

            // Generate getters and setters for all properties
            classInfo.properties.forEach(prop => {
                javaCode += generateGetter(prop);
                javaCode += generateSetter(prop);
            });

            // Generate methods
            classInfo.methods.forEach(method => {
                const visibility = method.visibility === 'private' ? 'private' :
                                   method.visibility === 'public' ? 'public' :
                                   method.visibility === 'protected' ? 'protected' : '';

                // Generate method signature
                const paramString = method.parameters.map(param =>
                    `${param.type} ${param.name}`
                ).join(', ');

                javaCode += `    ${visibility} ${method.type} ${method.name}(${paramString}) {\n`;
                
                // If this is a child class method and there's a parent method with the same name,
                // we'll add an example of method overriding
                if (parentClass) {
                    javaCode += `        // Method can override parent class method if needed\n`;
                }
                
                javaCode += `        // TODO: Implement method body\n`;
                javaCode += `        ${method.type === 'void' ? '' : 'return null; // Placeholder return'}\n`;
                javaCode += `    }\n\n`;
            });

            // Additional method to demonstrate polymorphism (optional)
            if (parentClass) {
                javaCode += `    @Override\n`;
                javaCode += `    public String toString() {\n`;
                javaCode += `        return "${classInfo.name} [Subclass of ${parentClass}]";\n`;
                javaCode += `    }\n\n`;
            }

            // End of class definition
            javaCode += '}\n\n';
        });

        // Add comments about relationships
        javaCode += '// Relationships:\n';
        if (classesData.relationships) {
            classesData.relationships.forEach(rel => {
                const sourceClass = classesData.classes.find(c => c.key === rel.from);
                const targetClass = classesData.classes.find(c => c.key === rel.to);

                if (sourceClass && targetClass) {
                    javaCode += `// ${sourceClass.name} ${rel.type} ${targetClass.name}`;
                    if (rel.multiplicity) {
                        javaCode += ` (Multiplicity: ${rel.multiplicity})`;
                    }
                    javaCode += '\n';
                }
            });
        }

        setGeneratedCode(javaCode);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode)
            .then(() => alert('Java code copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    };

    return (
        <div className="java-code-generator">
            <button 
                onClick={generateJavaCode}
                className="menu-btn"
            >
                Generate Java Code
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

export default JavaCodeGenerator;