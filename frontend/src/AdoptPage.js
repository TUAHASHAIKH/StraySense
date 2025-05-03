// AdoptPage.js - Displays animals available for adoption
// TODO: Replace dummy data with SQL database integration
// Database schema should include:
// - id (primary key)
// - name
// - type (enum: 'Dog', 'Cat', 'Other')
// - age
// - image_url
// - description
// - status (available, adopted, pending)
// - created_at
// - updated_at

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdoptPage.css';
import logo from './assets/logo.jpg';

const AdoptPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pets, setPets] = useState([]); // Will be populated from database
  const [loading, setLoading] = useState(false); // For loading state when fetching from database

  // TODO: Replace with actual API call to fetch pets from database
  // useEffect(() => {
  //   const fetchPets = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch('/api/pets');
  //       const data = await response.json();
  //       setPets(data);
  //     } catch (error) {
  //       console.error('Error fetching pets:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchPets();
  // }, []);

  // Temporary dummy data - will be replaced with database data
  const dummyPets = [
    {
      id: 1,
      name: "Luna",
      type: "Cat",
      age: "2 years",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      description: "A playful and affectionate cat who loves to cuddle and play with toys."
    },
    {
      id: 2,
      name: "Max",
      type: "Dog",
      age: "3 years",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      description: "A friendly and energetic dog who loves long walks and playing fetch."
    },
    {
      id: 3,
      name: "Bella",
      type: "Cat",
      age: "1 year",
      image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
      description: "A sweet and gentle cat who enjoys sunbathing and playing with string toys."
    },
    {
      id: 4,
      name: "Charlie",
      type: "Dog",
      age: "4 years",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
      description: "A loyal and intelligent dog who loves learning new tricks and going on adventures."
    },
    {
      id: 5,
      name: "Oliver",
      type: "Cat",
      age: "3 years",
      image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80",
      description: "A curious and independent cat who loves exploring and watching birds from the window."
    },
    {
      id: 6,
      name: "Daisy",
      type: "Dog",
      age: "2 years",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      description: "A friendly and playful dog who loves making new friends and playing in the park."
    },
    {
      id: 7,
      name: "Pepper",
      type: "Other",
      age: "1 year",
      image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80",
      description: "A cute and friendly rabbit who loves hopping around and munching on fresh vegetables."
    },
    {
      id: 8,
      name: "Rocky",
      type: "Other",
      age: "2 years",
      image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80",
      description: "A gentle and curious hamster who enjoys exploring his habitat and playing with toys."
    }
  ];

  // Initialize pets with dummy data
  useEffect(() => {
    setPets(dummyPets);
  }, []);

  // Filter pets based on selected type
  const filteredPets = activeFilter === 'All' 
    ? pets 
    : pets.filter(pet => {
        // Convert both the pet type and active filter to lowercase for comparison
        const petType = pet.type.toLowerCase();
        const filterType = activeFilter.toLowerCase();
        return petType === filterType;
      });

  // Add console log for debugging
  console.log('Active Filter:', activeFilter);
  console.log('Filtered Pets:', filteredPets);

  // TODO: Implement adoption process
  const handleAdopt = async (petId) => {
    // Will be replaced with actual adoption API call
    // try {
    //   const response = await fetch(`/api/pets/${petId}/adopt`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ status: 'pending' }),
    //   });
    //   if (response.ok) {
    //     // Update local state or refetch pets
    //   }
    // } catch (error) {
    //   console.error('Error adopting pet:', error);
    // }
    alert('Adoption process coming soon!');
  };

  return (
    <div className="adopt-page">
      <header className="adopt-header">
        <div className="header-content">
          <div className="logo-title">
            <img src={logo} alt="StraySense Logo" className="logo" />
            <span className="title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <a href="#filters" className="nav-link active">Adopt</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); alert('Coming soon!'); }}>Donate</a>
          </nav>
        </div>
      </header>

      <main className="adopt-content">
        <div className="filters" id="filters">
          <h3>Find Your Perfect Companion</h3>
          <div className="filter-group">
            <button 
              className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to All');
                setActiveFilter('All');
              }}
            >
              All
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Dog' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Dog');
                setActiveFilter('Dog');
              }}
            >
              Dogs
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Cat' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Cat');
                setActiveFilter('Cat');
              }}
            >
              Cats
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Other' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Other');
                setActiveFilter('Other');
              }}
            >
              Other
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading pets...</div>
        ) : (
          <div className="adopt-grid">
            {filteredPets.map(pet => (
              <div className="pet-card" key={pet.id}>
                <div className="pet-image-container">
                  <img src={pet.image} alt={pet.name} className="pet-image" />
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <div className="pet-details">
                    <span>{pet.type}</span> • <span>{pet.age}</span>
                  </div>
                  <p className="pet-description">{pet.description}</p>
                  <button 
                    className="adopt-button"
                    onClick={() => handleAdopt(pet.id)}
                  >
                    Adopt {pet.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdoptPage; 