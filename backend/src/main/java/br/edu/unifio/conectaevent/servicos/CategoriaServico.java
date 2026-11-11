package br.edu.unifio.conectaevent.servicos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import br.edu.unifio.conectaevent.entidades.Categoria;
import br.edu.unifio.conectaevent.excecoes.RecursoNaoEncontradoException;
import br.edu.unifio.conectaevent.excecoes.RegraNegocioException;
import br.edu.unifio.conectaevent.excecoes.RequisicaoInvalidaException;
import br.edu.unifio.conectaevent.repositorios.CategoriaRepositorio;
import br.edu.unifio.conectaevent.repositorios.EventoRepositorio;

@Service
public class CategoriaServico {
    @Autowired
    private CategoriaRepositorio categoriaRepositorio;

    @Autowired
    private EventoRepositorio eventoRepositorio;

    public List<Categoria> listar() {
        return categoriaRepositorio.findAll(Sort.by("nome"));
    }

    public Categoria buscarPorId(Integer id) {
        if (id == null) {
            throw new RequisicaoInvalidaException("Informe o id da categoria.");
        }
        return categoriaRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria com id " + id + " não encontrada."));
    }

    public Categoria salvar(Categoria categoria) {
        categoria.setId(null);
        if (categoriaRepositorio.existsByNomeIgnoreCase(categoria.getNome())) {
            throw new RegraNegocioException("Já existe uma categoria chamada " + categoria.getNome() + ".");
        }
        return categoriaRepositorio.save(categoria);
    }

    public Categoria atualizar(Integer id, Categoria dados) {
        Categoria categoria = buscarPorId(id);
        if (categoriaRepositorio.existsByNomeIgnoreCaseAndIdNot(dados.getNome(), id)) {
            throw new RegraNegocioException("Já existe outra categoria chamada " + dados.getNome() + ".");
        }
        categoria.setNome(dados.getNome());
        categoria.setDescricao(dados.getDescricao());
        return categoriaRepositorio.save(categoria);
    }

    public void excluir(Integer id) {
        Categoria categoria = buscarPorId(id);
        // Regra: categoria em uso não pode ser excluída.
        if (eventoRepositorio.existsByCategoriaId(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir a categoria " + categoria.getNome() + ": existem eventos associados a ela.");
        }
        categoriaRepositorio.deleteById(id);
    }
}
