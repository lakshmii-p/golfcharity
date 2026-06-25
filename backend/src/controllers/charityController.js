const supabase = require('../utils/supabase');

const getCharities = async (req, res) => {
  try {
    const { search, featured } = req.query;
    let query = supabase.from('charities').select('*').order('name');

    if (search) query = query.ilike('name', `%${search}%`);
    if (featured === 'true') query = query.eq('featured', true);

    const { data: charities, error } = await query;
    if (error) throw error;
    res.json({ charities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charities' });
  }
};

const getCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: charity, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !charity) return res.status(404).json({ error: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charity' });
  }
};

const createCharity = async (req, res) => {
  try {
    const { name, description, imageUrl, website, upcomingEvents, featured } = req.body;

    const { data: charity, error } = await supabase
      .from('charities')
      .insert({ name, description, image_url: imageUrl, website, upcoming_events: upcomingEvents, featured: featured || false })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create charity' });
  }
};

const updateCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, website, upcomingEvents, featured } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (website !== undefined) updates.website = website;
    if (upcomingEvents !== undefined) updates.upcoming_events = upcomingEvents;
    if (featured !== undefined) updates.featured = featured;

    const { data: charity, error } = await supabase
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update charity' });
  }
};

const deleteCharity = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('charities').delete().eq('id', id);
    res.json({ message: 'Charity deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete charity' });
  }
};

module.exports = { getCharities, getCharity, createCharity, updateCharity, deleteCharity };
