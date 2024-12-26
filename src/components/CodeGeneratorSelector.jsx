import React, { useState } from 'react';
import JavaCodeGenerator from './JavaCodeGenerator';
import PhpCodeGenerator from './PhpCodeGenerator';
import PythonCodeGenerator from './PythonCodeGenerator';

const CodeGeneratorSelector = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('java');

    const renderGenerator = () => {
        switch (selectedLanguage) {
            case 'java':
                return <JavaCodeGenerator />;
            case 'php':
                return <PhpCodeGenerator />;
            case 'python':
                return <PythonCodeGenerator />;
            default:
                return null;
        }
    };

    return (
        <div className="code-generator-section">
            <div className="language-selector">
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select"
                >
                    <option value="java">Java</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                </select>
            </div>
            {renderGenerator()}
        </div>
    );
};

export default CodeGeneratorSelector;