import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Play, Plus, X } from 'lucide-react';

const WheelOfFortune = () => {
  // Загружаем данные из памяти при инициализации
  const loadFromMemory = () => {
    const savedData = window.wheelData || {};
    return {
      originalNames: savedData.originalNames || ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
      currentNames: savedData.currentNames || ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
      selectedHistory: savedData.selectedHistory || []
    };
  };

  const initialData = loadFromMemory();
  const [originalNames, setOriginalNames] = useState(initialData.originalNames);
  const [currentNames, setCurrentNames] = useState(initialData.currentNames);
  const [selectedHistory, setSelectedHistory] = useState(initialData.selectedHistory);
  const [newName, setNewName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedName, setSelectedName] = useState('');
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef(null);

  // Сохраняем данные в память при изменении
  const saveToMemory = (data) => {
    window.wheelData = {
      originalNames: data.originalNames || originalNames,
      currentNames: data.currentNames || currentNames,
      selectedHistory: data.selectedHistory || selectedHistory
    };
  };

  // Сохраняем при изменении состояния
  useEffect(() => {
    saveToMemory({ originalNames, currentNames, selectedHistory });
  }, [originalNames, currentNames, selectedHistory]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9'
  ];

  const addName = () => {
    if (newName.trim() && !originalNames.includes(newName.trim())) {
      const updatedNames = [...originalNames, newName.trim()];
      setOriginalNames(updatedNames);
      setCurrentNames([...currentNames, newName.trim()]);
      setNewName('');
    }
  };

  const removeName = (nameToRemove) => {
    const updatedOriginalNames = originalNames.filter(name => name !== nameToRemove);
    const updatedCurrentNames = currentNames.filter(name => name !== nameToRemove);
    const updatedHistory = selectedHistory.filter(entry => entry.name !== nameToRemove);
    
    setOriginalNames(updatedOriginalNames);
    setCurrentNames(updatedCurrentNames);
    setSelectedHistory(updatedHistory);
  };

  const spinWheel = () => {
    if (currentNames.length === 0 || spinning) return;

    setSpinning(true);
    setShowResult(false);
    setSelectedName('');

    // Random rotation between 1440 and 2160 degrees (4-6 full rotations)
    const spinAmount = Math.random() * 720 + 1440;
    const newRotation = rotation + spinAmount;
    
    setRotation(newRotation);

    // Calculate which segment we land on
    const segmentAngle = 360 / currentNames.length;
    const normalizedRotation = (360 - (newRotation % 360)) % 360;
    const selectedIndex = Math.floor(normalizedRotation / segmentAngle);
    const selected = currentNames[selectedIndex];

    // Stop spinning after animation
    setTimeout(() => {
      setSpinning(false);
      setSelectedName(selected);
      setShowResult(true);
      
      // Добавляем в историю выбранных
      const newHistoryEntry = {
        name: selected,
        timestamp: new Date().toLocaleString(),
        order: selectedHistory.length + 1
      };
      
      // Remove selected name from current names and update history
      setTimeout(() => {
        setCurrentNames(prev => prev.filter(name => name !== selected));
        setSelectedHistory(prev => [...prev, newHistoryEntry]);
      }, 1500);
    }, 3000);
  };

  const resetWheel = () => {
    setCurrentNames([...originalNames]);
    setSelectedName('');
    setShowResult(false);
    setRotation(0);
    setSelectedHistory([]);
  };

  const renderWheel = () => {
    if (currentNames.length === 0) {
      return (
        <div className="w-80 h-80 rounded-full border-8 border-gray-300 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-center">No names left!<br />Click Reset to start over</p>
        </div>
      );
    }

    const segmentAngle = 360 / currentNames.length;
    
    return (
      <div className="relative">
        <svg
          ref={wheelRef}
          width="320"
          height="320"
          className="drop-shadow-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {currentNames.map((name, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = 160 + 150 * Math.cos(startAngleRad);
            const y1 = 160 + 150 * Math.sin(startAngleRad);
            const x2 = 160 + 150 * Math.cos(endAngleRad);
            const y2 = 160 + 150 * Math.sin(endAngleRad);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M 160 160`,
              `L ${x1} ${y1}`,
              `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            const textAngle = startAngle + segmentAngle / 2;
            const textRadius = 100;
            const textX = 160 + textRadius * Math.cos((textAngle * Math.PI) / 180);
            const textY = 160 + textRadius * Math.sin((textAngle * Math.PI) / 180);

            return (
              <g key={name}>
                <path
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {name}
                </text>
              </g>
            );
          })}
          <circle cx="160" cy="160" r="15" fill="#333" />
        </svg>
        
        {/* Pointer */}
        <div className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2">
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-red-500"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎯 Wheel of Fortune
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Wheel Section */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center space-y-6">
              {renderWheel()}
              
              {/* Result Display */}
              {showResult && selectedName && (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center animate-pulse">
                  <p className="text-lg font-bold text-green-800">🎉 Selected: {selectedName}</p>
                </div>
              )}
              
              {/* Control Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={spinWheel}
                  disabled={spinning || currentNames.length === 0}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  <Play size={20} />
                  <span>{spinning ? 'Spinning...' : 'Spin!'}</span>
                </button>
                
                <button
                  onClick={resetWheel}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Names Management Section */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Manage Names</h2>
            
            {/* Add Name */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addName()}
                  placeholder="Enter a name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addName}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Names List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              <h3 className="font-semibold text-gray-700 mb-2">Original Names ({originalNames.length}):</h3>
              {originalNames.map((name, index) => (
                <div
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    currentNames.includes(name) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200 opacity-60'
                  }`}
                >
                  <span className={`font-medium ${
                    currentNames.includes(name) ? 'text-green-800' : 'text-red-600 line-through'
                  }`}>
                    {name}
                  </span>
                  <button
                    onClick={() => removeName(name)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>✅ Green: Still in wheel ({currentNames.length})</p>
              <p>❌ Red: Already selected ({originalNames.length - currentNames.length})</p>
            </div>

            {/* История выбранных имен */}
            {selectedHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">📋 History of Selected Names:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedHistory.map((entry, index) => (
                    <div
                      key={`${entry.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <span className="font-medium text-blue-800">
                        #{entry.order} {entry.name}
                      </span>
                      <span className="text-xs text-blue-600">
                        {entry.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelOfFortune;