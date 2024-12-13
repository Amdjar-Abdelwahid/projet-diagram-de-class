import React, { useEffect, useRef, useState } from "react";
import * as go from "gojs";
import "../assets/css/ClassDiagram.css";
import classesData from './classes.json';

const ClassDiagram = () => {
    const diagramRef = useRef(null);
    const [diagram, setDiagram] = useState(null);

    // States for modal and class form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
    const [newClass, setNewClass] = useState({
        name: "",
        properties: [],
        methods: [],
    });

    // New state for relationships
    const [relationships, setRelationships] = useState(classesData.relationships || []);
    const [newRelationship, setNewRelationship] = useState({
        sourceClass: "",
        targetClass: "",
        type: "inheritance",
        multiplicity: "",
        label: ""
    });

    const [classes, setClasses] = useState(classesData.classes); 
    

    useEffect(() => {
        // Ensure we don't recreate the diagram if it already exists
        if (diagram) return;

        const $ = go.GraphObject.make;

        // Check if the ref is available
        if (!diagramRef.current) return;

        // Ensure the div is not already associated with a diagram
        if (diagramRef.current.children.length > 0) {
            diagramRef.current.innerHTML = '';
        }

        // Initialize the diagram
        const diagramInstance = $(go.Diagram, diagramRef.current, {
            "undoManager.isEnabled": true,
            layout: $(go.ForceDirectedLayout, {
                isInitial: true,
                isOngoing: true,
                maxIterations: 200,
                defaultSpringLength: 50,
                defaultElectricalCharge: 100
            })
        });

        // Define node and link templates (same as in your original code)
        const convertVisibility = (v) => {
            switch (v) {
                case "public": return "+";
                case "private": return "-";
                case "protected": return "#";
                case "package": return "~";
                default: return v;
            }
        };

        const propertyTemplate = $(go.Panel, "Horizontal",
            $(go.TextBlock, { width: 12 }, new go.Binding("text", "visibility", convertVisibility)),
            $(go.TextBlock, { editable: true }, new go.Binding("text", "name")),
            $(go.TextBlock, "", new go.Binding("text", "type", (t) => (t ? ": " : ""))),
            $(go.TextBlock, { editable: true }, new go.Binding("text", "type"))
        );

        const methodTemplate = $(go.Panel, "Horizontal",
            $(go.TextBlock, { width: 12 }, new go.Binding("text", "visibility", convertVisibility)),
            $(go.TextBlock, { editable: true }, new go.Binding("text", "name")),
            $(go.TextBlock, "()", new go.Binding("text", "parameters", (parr) => {
                let s = "(";
                parr.forEach((param, i) => {
                    if (i > 0) s += ", ";
                    s += `${param.name}: ${param.type}`;
                });
                return `${s})`;
            })),
            $(go.TextBlock, { editable: true }, new go.Binding("text", "type"))
        );

        diagramInstance.nodeTemplate = $(go.Node, "Auto",
            $(go.Shape, { fill: "lightyellow" }),
            $(go.Panel, "Table", { defaultRowSeparatorStroke: "black", defaultColumnSeparatorStroke: "black" },
                $(go.TextBlock, { row: 0, font: "bold 12pt sans-serif" }, new go.Binding("text", "name")),
                $(go.Panel, "Vertical", { row: 1, itemTemplate: propertyTemplate }, new go.Binding("itemArray", "properties")),
                $(go.Panel, "Vertical", { row: 2, itemTemplate: methodTemplate }, new go.Binding("itemArray", "methods"))
            ),
            new go.Binding("desiredSize", "size", (size) => size || new go.Size(150, 150))
        );

        // Link template
        diagramInstance.linkTemplateMap.add("generalization", 
            $(go.Link,
                $(go.Shape),
                $(go.Shape, { toArrow: "Triangle", fill: "white" })
        ));
        
        diagramInstance.linkTemplateMap.add("association", 
            $(go.Link,
                $(go.Shape),
                $(go.Shape, { toArrow: "OpenTriangle" })
        ));
        
        diagramInstance.linkTemplateMap.add("composition", 
            $(go.Link,
                $(go.Shape),
                $(go.Shape, { fromArrow: "StretchedDiamond", scale: 1.5 }),
                $(go.Shape, { toArrow: "OpenTriangle" })
        ))
        
        diagramInstance.linkTemplateMap.add("aggregation", 
            $(go.Link,
                $(go.Shape),
                $(go.Shape, { fromArrow: "StretchedDiamond", fill: "white", scale: 1.5 }),
                $(go.Shape, { toArrow: "OpenTriangle" })
        ));
        
        // Utilisez le linkTemplateMap dans le modèle
        diagramInstance.model = new go.GraphLinksModel({
            nodeDataArray: classes,
            linkDataArray: relationships
        });


        // Set the diagram in state
        setDiagram(diagramInstance);

        // Cleanup function
        return () => {
            if (diagramInstance) {
                diagramInstance.clear();
                diagramInstance.div = null;
            }
        };
    }, []);

    const saveRelationship = () => {
        if (!newRelationship.sourceClass || !newRelationship.targetClass) {
            alert("Please select both source and target classes.");
            return;
        }
        
        if (!diagram) {
            alert("Diagram is not initialized.");
            return;
        }
    
        // Find the source and target class names for labeling
        const sourceClassName = classes.find(cls => cls.key === parseInt(newRelationship.sourceClass))?.name || 'Unknown';
        const targetClassName = classes.find(cls => cls.key === parseInt(newRelationship.targetClass))?.name || 'Unknown';
    
        // const relationshipCategories = {
        //     'inheritance': 'Generalization',
        //     'realization': 'Realization',
        //     'association': 'Association',
        //     'composition': 'Composition',
        //     'aggregation': 'Aggregation',
        //     'dependency': 'Dependency'
        // };
    
        // const relationshipArrows = {
        //     'generalization': { toArrow: 'Triangle',fromArrow: '', fill: 'white' },
        //     'association': { toArrow: 'OpenTriangle', fromArrow: '' },
        //     'composition': { toArrow: 'OpenTriangle', fromArrow: 'StretchedDiamond', scale: 1.5 },
        //     'aggregation': { toArrow: 'OpenTriangle', fromArrow: 'StretchedDiamond', fill: 'white', scale: 1.5 }
        // };
    
        const newRelationshipData = {
            from: parseInt(newRelationship.sourceClass), 
            to: parseInt(newRelationship.targetClass),
            type: newRelationship.type,  // Assurez-vous que le type est transmis
            label: newRelationship.label || 
                  `${sourceClassName} ${newRelationship.type} ${targetClassName}`, 
            multiplicity: newRelationship.multiplicity || "",
            category: newRelationship.type  // Ajoutez cette ligne pour utiliser le bon template
        };
    
        // Update relationships in the state and JSON
        const updatedRelationships = [...relationships, newRelationshipData];

        console.log("Source Class:", newRelationship.sourceClass);
        console.log("Target Class:", newRelationship.targetClass);
        console.log("Classes:", classes);
        
        try {
            // If you have a backend, you'd typically save this to a file or database
            console.log('Saving relationships:', updatedRelationships);
            
            // Update the diagram
            diagram.model.addLinkData(newRelationshipData);
            
            // Update state
            setRelationships(updatedRelationships);
    
            // Reset form
            setNewRelationship({
                sourceClass: "",
                targetClass: "",
                type: "inheritance",
                multiplicity: "",
                label: ""
            });
    
            // Close modal
            setIsRelationModalOpen(false);
    
            // Optional: Force diagram refresh
            diagram.rebuildParts();
        } catch (error) {
            console.error("Error saving relationship:", error);
            alert("Failed to save relationship. Please try again.");
        }
    };

    const handleOpenRelationModal = () => setIsRelationModalOpen(true);
    const handleCloseRelationModal = () => setIsRelationModalOpen(false);

    const saveClassesToJson = (updatedClasses) => {
        // In a real application, you'd use a backend API to write to the file
        console.log('Saving classes:', updatedClasses);
        setClasses(updatedClasses);
        
        // If you have a backend, you would make an API call here to update the JSON file
        // fetch('/api/save-classes', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ classes: updatedClasses })
        // });
    };

    // Handlers for modal
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleAddClass = () => {
        if (!diagram) {
            console.error("Diagram is not initialized.");
            return;
        }

        // Create the class data from the form
        const newClassData = {
            key: Date.now(),
            name: newClass.name,
            properties: newClass.properties,
            methods: newClass.methods,
        };

        const updatedClasses = [...classes, newClassData];
        saveClassesToJson(updatedClasses);

        // Add new class node to the diagram
        diagram.model.addNodeData(newClassData);

        // Reset the form after adding the class
        setNewClass({ name: "", properties: [], methods: [] });
        handleCloseModal();  // Close modal after adding the class
    };

    const handleAddAttribute = () => {
        setNewClass((prev) => ({
            ...prev,
            properties: [
                ...prev.properties,
                { name: "", type: "", visibility: "public" },
            ],
        }));
    };

    const handleAddMethod = () => {
        setNewClass((prev) => ({
            ...prev,
            methods: [
                ...prev.methods,
                { name: "", type: "", visibility: "public", parameters: [] },
            ],
        }));
    };

    const handleAddParameter = (methodIndex) => {
        setNewClass((prev) => {
            const methods = [...prev.methods]; // Copy existing methods
            const updatedParameters = [
                ...methods[methodIndex].parameters,
                { name: "", type: "" }, // Add a new empty parameter
            ];

            methods[methodIndex] = {
                ...methods[methodIndex],
                parameters: updatedParameters, // Update the method's parameters
            };

            return { ...prev, methods };
        });
    };

    return (
        <div className="container">
            <div className="menu">
                <h3>Elements</h3>
                <button className="menu-btn" onClick={() => setIsModalOpen(true)}>
                    Add Class
                </button>
                <button className="menu-btn" onClick={() => setIsRelationModalOpen(true)}>
                    Add Relationship
                </button>
            </div>
            <div className="graph-editor">
                <div ref={diagramRef} className="graph-container" />
            </div>

            {/* Relationship Modal */}
            {isRelationModalOpen && (
                <div className="modal">
                    <h3>Add Class Relationship</h3>
                    <div className="input-group">
                        <label>Source Class:</label>
                        <select 
                            value={newRelationship.sourceClass}
                            onChange={(e) => {
                                console.log("Selected source class:", e.target.value);
                                setNewRelationship(prev => ({
                                    ...prev, 
                                    sourceClass: e.target.value
                                }))
                            }}
                        >
                            <option value="">Select Source Class</option>
                            {classes.map(cls => (
                                <option key={cls.key} value={cls.key}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Target Class:</label>
                        <select 
                            value={newRelationship.targetClass}
                            onChange={(e) => setNewRelationship(prev => ({
                                ...prev, 
                                targetClass: e.target.value
                            }))}
                        >
                            <option value="">Select Target Class</option>
                            {classes.map(cls => (
                                <option key={cls.key} value={cls.key}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Relationship Type:</label>
                        <select 
                            value={newRelationship.type}
                            onChange={(e) => setNewRelationship(prev => ({
                                ...prev, 
                                type: e.target.value
                            }))}
                        >
                            <option value="generalization">Generalization</option>
                            <option value="association">Association</option>
                            <option value="composition">Composition</option>
                            <option value="aggregation">Aggregation</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Multiplicity (Optional):</label>
                        <input 
                            type="text" 
                            placeholder="e.g., 1..*, 0..1"
                            value={newRelationship.multiplicity}
                            onChange={(e) => setNewRelationship(prev => ({
                                ...prev, 
                                multiplicity: e.target.value
                            }))}
                        />
                    </div>

                    <div className="input-group">
                        <label>Relationship Label (Optional):</label>
                        <input 
                            type="text" 
                            placeholder="Relationship description"
                            value={newRelationship.label}
                            onChange={(e) => setNewRelationship(prev => ({
                                ...prev, 
                                label: e.target.value
                            }))}
                        />
                    </div>

                    <button className="save-btn" onClick={saveRelationship}>
                        Save Relationship
                    </button>
                    <button className="cancel-btn" onClick={handleCloseRelationModal}>
                        Cancel
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal">
                    <h3>Add New Class</h3>
                    <label>
                        Class Name:
                        <input
                            type="text"
                            value={newClass.name}
                            onChange={(e) =>
                                setNewClass({ ...newClass, name: e.target.value })
                            }
                        />
                    </label>

                    <h4>Attributes</h4>
                    {newClass.properties.map((prop, index) => (
                        <div key={index} className="input-group">
                            <input
                                type="text"
                                placeholder="Name"
                                value={prop.name}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const properties = [...prev.properties];
                                        properties[index].name = e.target.value;
                                        return { ...prev, properties };
                                    })
                                }
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={prop.type}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const properties = [...prev.properties];
                                        properties[index].type = e.target.value;
                                        return { ...prev, properties };
                                    })
                                }
                            />
                            <select
                                value={prop.visibility}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const properties = [...prev.properties];
                                        properties[index].visibility =
                                            e.target.value;
                                        return { ...prev, properties };
                                    })
                                }
                            >
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                                <option value="protected">Protected</option>
                            </select>
                        </div>
                    ))}
                    <button onClick={handleAddAttribute}>Add Attribute</button>

                    <h4>Methods</h4>
                    {newClass.methods.map((method, methodIndex) => (
                        <div key={methodIndex} className="input-group">
                            <input
                                type="text"
                                placeholder="Method Name"
                                value={method.name}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const methods = [...prev.methods];
                                        methods[methodIndex].name = e.target.value;
                                        return { ...prev, methods };
                                    })
                                }
                            />
                            <input
                                type="text"
                                placeholder="Return Type"
                                value={method.type}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const methods = [...prev.methods];
                                        methods[methodIndex].type = e.target.value;
                                        return { ...prev, methods };
                                    })
                                }
                            />
                            <select
                                value={method.visibility}
                                onChange={(e) =>
                                    setNewClass((prev) => {
                                        const methods = [...prev.methods];
                                        methods[methodIndex].visibility =
                                            e.target.value;
                                        return { ...prev, methods };
                                    })
                                }
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="protected">Protected</option>
                            </select>

                            {/* Parameters Section */}
                            <h5>Parameters</h5>
                            {method.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Parameter Name"
                                        value={param.name}
                                        onChange={(e) =>
                                            setNewClass((prev) => {
                                                const methods = [...prev.methods];
                                                methods[methodIndex].parameters[
                                                    paramIndex
                                                ].name = e.target.value;
                                                return { ...prev, methods };
                                            })
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Parameter Type"
                                        value={param.type}
                                        onChange={(e) =>
                                            setNewClass((prev) => {
                                                const methods = [...prev.methods];
                                                methods[methodIndex].parameters[
                                                    paramIndex
                                                ].type = e.target.value;
                                                return { ...prev, methods };
                                            })
                                        }
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddParameter(methodIndex)}
                            >
                                Add Parameter
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddMethod}>Add Method</button>

                    <button className="save-btn" onClick={handleAddClass}>
                        Save Class
                    </button>
                    <button className="cancel-btn" onClick={handleCloseModal}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClassDiagram; 