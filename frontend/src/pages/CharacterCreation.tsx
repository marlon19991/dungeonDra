import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CreateCharacterData, AbilityScores } from '../types/Character';
import { translateClass } from '../utils/translations';

interface CharacterCreationProps {
  onCharacterCreated?: () => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
  const [formData, setFormData] = useState<CreateCharacterData>({
    name: '',
    characterClass: '',
    level: 1,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    maxHitPoints: 8,
    armorClass: 10,
    experience: 0,
  });

  const [characterClasses, setCharacterClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadCharacterClasses();
  }, []);

  useEffect(() => {
    calculateDerivedStats();
  }, [formData.abilityScores, formData.characterClass]);

  const loadCharacterClasses = async () => {
    try {
      const classes = await apiService.getCharacterClasses();
      setCharacterClasses(classes);
      if (classes.length > 0) {
        setFormData(prev => ({ ...prev, characterClass: classes[0] }));
      }
    } catch {
      setError('Error al cargar las clases de personaje');
    }
  };

  const calculateDerivedStats = () => {
    const constitutionModifier = Math.floor((formData.abilityScores.constitution - 10) / 2);
    const dexterityModifier = Math.floor((formData.abilityScores.dexterity - 10) / 2);

    let hitDie = 8;
    switch (formData.characterClass) {
      case 'fighter':
      case 'paladin':
      case 'ranger':
        hitDie = 10;
        break;
      case 'barbarian':
        hitDie = 12;
        break;
      case 'bard':
      case 'sorcerer':
      case 'wizard':
        hitDie = 6;
        break;
      default:
        hitDie = 8;
    }

    const maxHitPoints = Math.max(1, hitDie + constitutionModifier);
    const armorClass = 10 + dexterityModifier;

    setFormData(prev => ({
      ...prev,
      maxHitPoints,
      armorClass,
    }));
  };

  const rollAbilityScores = () => {
    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    const newScores: AbilityScores = {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };

    setFormData(prev => ({ ...prev, abilityScores: newScores }));
  };

  const handleAbilityScoreChange = (ability: keyof AbilityScores, value: string) => {
    const numValue = parseInt(value) || 3;
    const clampedValue = Math.max(3, Math.min(18, numValue));
    
    setFormData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        [ability]: clampedValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.createCharacter(formData);
      setSuccess('¡Personaje creado exitosamente!');
      onCharacterCreated?.();
      
      setFormData({
        name: '',
        characterClass: characterClasses[0] || '',
        level: 1,
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        maxHitPoints: 8,
        armorClass: 10,
        experience: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el personaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Crear Nuevo Personaje</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre del Personaje</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ingresa el nombre del personaje"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="characterClass">Clase de Personaje</label>
          <select
            id="characterClass"
            value={formData.characterClass}
            onChange={(e) => setFormData(prev => ({ ...prev, characterClass: e.target.value }))}
            required
          >
            {characterClasses.map(cls => (
              <option key={cls} value={cls}>
                {translateClass(cls)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="level">Nivel</label>
          <input
            type="number"
            id="level"
            min="1"
            max="20"
            value={formData.level}
            onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Puntuaciones de Habilidad</h3>
            <button type="button" className="button secondary" onClick={rollAbilityScores}>
              🎲 Tirar Estadísticas
            </button>
          </div>

          <div className="ability-scores">
            {Object.entries(formData.abilityScores).map(([ability, value]) => (
              <div key={ability} className="form-group">
                <label htmlFor={ability}>
                  {(() => {
                    const abilityTranslations: { [key: string]: string } = {
                      'strength': 'Fue',
                      'dexterity': 'Des',
                      'constitution': 'Con',
                      'intelligence': 'Int',
                      'wisdom': 'Sab',
                      'charisma': 'Car'
                    };
                    return abilityTranslations[ability] || ability.charAt(0).toUpperCase() + ability.slice(1).substring(0, 3);
                  })()}
                </label>
                <input
                  type="number"
                  id={ability}
                  min="3"
                  max="18"
                  value={value}
                  onChange={(e) => handleAbilityScoreChange(ability as keyof AbilityScores, e.target.value)}
                />
                <div style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                  {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Puntos de Vida</label>
            <input type="text" value={formData.maxHitPoints} readOnly />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Clase de Armadura</label>
            <input type="text" value={formData.armorClass} readOnly />
          </div>
        </div>

        <button type="submit" className="button" disabled={loading || !formData.name.trim()}>
          {loading ? 'Creando...' : 'Crear Personaje'}
        </button>
      </form>
    </div>
  );
};